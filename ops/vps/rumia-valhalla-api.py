#!/usr/bin/env python3
"""Loopback-only Valhalla adapter for Rumia's geographic route contract.

This is deliberately a small internal boundary. It accepts reviewed stop
coordinates, never writes request payloads, rejects unsupported transit until a
GTFS feed is approved, and returns Rumia's own WGS84 route shape rather than
leaking raw Valhalla errors or provider response fields.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from typing import Any

from valhalla import Actor, __version__
from valhalla.midgard.utils import decode_polyline

MAX_BODY_BYTES = 64 * 1024
MAX_STOPS = 10
ID_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")
MODE_TO_COSTING = {"walk": "pedestrian", "drive": "auto", "cycle": "bicycle"}
ATTRIBUTION = f"© OpenStreetMap contributors via Valhalla {__version__}"
ROUTE_LOCK = Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def error_payload(code: str, message: str) -> dict[str, str]:
    return {"error": code, "message": message}


def parse_request(payload: Any) -> tuple[list[dict[str, Any]], str]:
    if not isinstance(payload, dict):
        raise ValueError("request must be an object")
    stops = payload.get("stops")
    mode = payload.get("mode")
    if not isinstance(stops, list) or not 2 <= len(stops) <= MAX_STOPS:
        raise ValueError("stops must contain between 2 and 10 items")
    if mode not in (*MODE_TO_COSTING, "transit"):
        raise ValueError("mode must be walk, drive, cycle, or transit")
    normalized: list[dict[str, Any]] = []
    for index, stop in enumerate(stops):
        if not isinstance(stop, dict):
            raise ValueError("each stop must be an object")
        stop_id = stop.get("id", f"stop-{index + 1}")
        if not isinstance(stop_id, str) or not ID_PATTERN.fullmatch(stop_id):
            raise ValueError("stop ids must be short stable identifiers")
        coordinates = stop.get("coordinates")
        if not isinstance(coordinates, list) or len(coordinates) != 2:
            raise ValueError("each stop needs [longitude, latitude] coordinates")
        lon, lat = coordinates
        if not isinstance(lon, (int, float)) or not isinstance(lat, (int, float)):
            raise ValueError("coordinates must be numbers")
        if not -180 <= lon <= 180 or not -90 <= lat <= 90:
            raise ValueError("coordinates are outside WGS84 bounds")
        activity_id = stop.get("activityId", stop_id)
        title = stop.get("title", stop_id)
        if not isinstance(activity_id, str) or not ID_PATTERN.fullmatch(activity_id):
            raise ValueError("activity ids must be short stable identifiers")
        if not isinstance(title, str) or not 1 <= len(title) <= 240:
            raise ValueError("titles must be short strings")
        normalized.append(
            {
                "id": stop_id,
                "activityId": activity_id,
                "title": title,
                "coordinates": [float(lon), float(lat)],
            }
        )
    return normalized, mode


def route_contract(actor: Actor, stops: list[dict[str, Any]], mode: str) -> dict[str, Any]:
    if mode == "transit":
        return error_payload("transit_unavailable", "Transit routing is not configured for this Portugal graph.")

    request = {
        "locations": [{"lon": stop["coordinates"][0], "lat": stop["coordinates"][1]} for stop in stops],
        "costing": MODE_TO_COSTING[mode],
        "units": "kilometers",
    }
    # The adapter is threaded for connection isolation, but serialize access
    # to the Valhalla Actor so one graph instance cannot be raced by requests.
    with ROUTE_LOCK:
        raw = actor.route(request)
    if not isinstance(raw, dict):
        return error_payload("route_invalid", "The route provider returned an invalid response.")
    if raw.get("error"):
        return error_payload("route_unavailable", "A validated route could not be produced for these stops.")

    legs = raw.get("trip", {}).get("legs", [])
    if not isinstance(legs, list) or len(legs) != len(stops) - 1:
        return error_payload("route_incomplete", "The route provider did not return every segment.")

    segments: list[dict[str, Any]] = []
    checked_at = utc_now()
    for index, leg in enumerate(legs):
        if not isinstance(leg, dict) or not isinstance(leg.get("shape"), str):
            return error_payload("route_incomplete", "The route provider returned a segment without geometry.")
        try:
            coordinates = [[float(lon), float(lat)] for lon, lat in decode_polyline(leg["shape"], 6)]
        except Exception:
            return error_payload("route_invalid", "The route geometry could not be validated.")
        if len(coordinates) < 2:
            return error_payload("route_incomplete", "The route provider returned an empty segment.")
        summary = leg.get("summary") if isinstance(leg.get("summary"), dict) else {}
        time_seconds = summary.get("time")
        length_km = summary.get("length")
        segments.append(
            {
                "fromStopId": stops[index]["id"],
                "toStopId": stops[index + 1]["id"],
                "mode": mode,
                "durationMinutes": round(float(time_seconds) / 60) if isinstance(time_seconds, (int, float)) else None,
                "distanceMeters": round(float(length_km) * 1000) if isinstance(length_km, (int, float)) else None,
                "geometry": {"type": "LineString", "coordinates": coordinates},
                "source": "provider",
                "checkedAt": checked_at,
                "attribution": ATTRIBUTION,
            }
        )

    return {
        "coordinateSystem": "WGS84",
        "status": "ready",
        "stops": [
            {
                "id": stop["id"],
                "activityId": stop["activityId"],
                "title": stop["title"],
                "dayIndex": 1,
                "order": index,
                "coordinates": stop["coordinates"],
            }
            for index, stop in enumerate(stops)
        ],
        "segments": segments,
    }


class Handler(BaseHTTPRequestHandler):
    actor: Actor

    def log_message(self, _format: str, *_args: Any) -> None:
        # Do not log coordinates, ids, or request payloads.
        return

    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self.send_json(200, {"status": "ok", "service": "rumia-valhalla", "version": __version__, "modes": ["walk", "drive", "cycle"]})
            return
        self.send_json(404, error_payload("not_found", "Route endpoint not found."))

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/route":
            self.send_json(404, error_payload("not_found", "Route endpoint not found."))
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("request body is missing or too large")
            payload = json.loads(self.rfile.read(length))
            stops, mode = parse_request(payload)
            result = route_contract(self.actor, stops, mode)
            self.send_json(200 if "error" not in result else 422, result)
        except (ValueError, json.JSONDecodeError):
            self.send_json(400, error_payload("invalid_request", "The route request is invalid."))
        except Exception:
            self.send_json(503, error_payload("route_unavailable", "The route service is temporarily unavailable."))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3012)
    args = parser.parse_args()
    Handler.actor = Actor(args.config)
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
