#!/usr/bin/env bash
set -euo pipefail

# Atomic, loopback-only map asset release helper. It changes only the Rumia
# map symlink and preflight services; it never touches the co-hosted Lumes
# service or public Caddy site.

ROOT="${RUMIA_MAP_ROOT:-/opt/rumia-map}"
CURRENT="$ROOT/current"
PREVIOUS="$ROOT/previous-release"

usage() {
  echo "usage: $0 validate <archive> | activate <archive> | rollback [archive]" >&2
  exit 2
}

archive_path() {
  local value="$1"
  if [[ "$value" = /* ]]; then
    printf '%s\n' "$value"
  else
    printf '%s/archives/%s\n' "$ROOT" "$value"
  fi
}

validate_archive() {
  local archive="$1"
  [[ -d "$archive" ]] || { echo "archive directory missing: $archive" >&2; exit 1; }
  [[ -f "$archive/portugal.pmtiles" ]] || { echo "PMTiles archive missing: $archive" >&2; exit 1; }
  [[ -f "$archive/portugal-style.json" ]] || { echo "MapLibre style missing: $archive" >&2; exit 1; }
  [[ -d "$archive/assets" ]] || { echo "style assets missing: $archive" >&2; exit 1; }
  printf 'validated %s\n' "$archive"
}

restart_preflight() {
  systemctl restart rumia-map-tiles.service
  /usr/bin/caddy validate --config /etc/caddy/Caddyfile >/dev/null
  /usr/bin/caddy reload --config /etc/caddy/Caddyfile --force >/dev/null
  systemctl is-active --quiet rumia-map-tiles.service
}

activate() {
  local archive="$1"
  validate_archive "$archive" >/dev/null
  local previous=""
  if [[ -L "$CURRENT" ]]; then
    previous=$(readlink "$CURRENT")
  fi
  printf '%s\n' "$previous" > "$PREVIOUS"
  ln -sfn "$archive" "$CURRENT.next"
  mv -Tf "$CURRENT.next" "$CURRENT"
  if ! restart_preflight; then
    if [[ -n "$previous" ]]; then
      ln -sfn "$previous" "$CURRENT.next"
      mv -Tf "$CURRENT.next" "$CURRENT"
      restart_preflight || true
    fi
    exit 1
  fi
  printf 'activated %s\n' "$archive"
}

rollback() {
  local archive="${1:-}"
  if [[ -z "$archive" ]]; then
    [[ -s "$PREVIOUS" ]] || { echo "no previous release recorded" >&2; exit 1; }
    archive=$(cat "$PREVIOUS")
  fi
  validate_archive "$archive" >/dev/null
  ln -sfn "$archive" "$CURRENT.next"
  mv -Tf "$CURRENT.next" "$CURRENT"
  restart_preflight
  printf 'rolled back to %s\n' "$archive"
}

[[ "$(id -u)" -eq 0 ]] || { echo "run as root" >&2; exit 1; }
[[ $# -ge 1 ]] || usage

case "$1" in
  validate|activate)
    [[ $# -ge 2 ]] || usage
    if [[ "$1" = validate ]]; then
      validate_archive "$(archive_path "$2")"
    else
      activate "$(archive_path "$2")"
    fi
    ;;
  rollback)
    if [[ $# -ge 2 ]]; then
      rollback "$(archive_path "$2")"
    else
      rollback
    fi
    ;;
  *) usage ;;
esac
