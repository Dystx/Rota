#!/usr/bin/env bash
set -euo pipefail

readonly releases_dir=/opt/apps/rumia/releases
readonly current_link=/opt/apps/rumia/current
readonly service_name=rumia-web.service
readonly health_url=http://127.0.0.1:3002/api/health
readonly health_attempts=30

if [[ $EUID -ne 0 ]]; then
  echo "deploy-rumia.sh must run as root." >&2
  exit 1
fi

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: deploy-rumia.sh <prepared-release-directory> [release-id]" >&2
  exit 2
fi

readonly source_dir=$(realpath -- "$1")
readonly release_id=${2:-$(date -u +%Y%m%dT%H%M%SZ)}
readonly target_dir="$releases_dir/$release_id"

install -d -o rumia -g rumia -m 0750 "$releases_dir"
readonly staging_dir=$(mktemp -d "$releases_dir/.staging.XXXXXX")

cleanup() {
  rm -rf -- "$staging_dir"
}
trap cleanup EXIT

if [[ ! -f "$source_dir/apps/web/.next/standalone/apps/web/server.js" ]]; then
  echo "Prepared release is missing apps/web/.next/standalone/apps/web/server.js." >&2
  exit 1
fi

# Next's standalone server changes its working directory to the nested app
# directory. Keep the browser assets beside that server so /_next/static and
# public files are served in production (not just in the local dev server).
if [[ ! -d "$source_dir/apps/web/.next/standalone/apps/web/.next/static" ]]; then
  echo "Prepared release is missing nested standalone Next static assets." >&2
  exit 1
fi

if [[ ! -d "$source_dir/apps/web/.next/standalone/apps/web/public" ]]; then
  echo "Prepared release is missing nested standalone public assets." >&2
  exit 1
fi

if [[ -e "$target_dir" || -L "$target_dir" ]]; then
  echo "Release already exists: $target_dir" >&2
  exit 1
fi

cp -a --no-preserve=ownership "$source_dir/." "$staging_dir/"
chown -R rumia:rumia "$staging_dir"
chmod -R u=rwX,g=rX,o= "$staging_dir"
mv -- "$staging_dir" "$target_dir"

previous_target=""
if [[ -L "$current_link" ]]; then
  previous_target=$(readlink -f -- "$current_link")
fi

rollback() {
  if [[ -n "$previous_target" && -d "$previous_target" ]]; then
    ln -s -- "$previous_target" "$current_link.rollback.$$"
    mv -Tf -- "$current_link.rollback.$$" "$current_link"
    systemctl restart "$service_name" || true
  else
    rm -f -- "$current_link"
    systemctl stop "$service_name" || true
  fi
}

ln -s -- "$target_dir" "$current_link.next.$$"
mv -Tf -- "$current_link.next.$$" "$current_link"

if ! systemctl restart "$service_name"; then
  echo "Rumia service failed to restart; restoring the previous release." >&2
  rollback
  exit 1
fi

health_ok=false
for _ in $(seq 1 "$health_attempts"); do
  if curl --fail --silent --show-error --max-time 2 "$health_url" >/dev/null; then
    health_ok=true
    break
  fi
  sleep 1
done

if [[ $health_ok != true ]]; then
  echo "Rumia loopback health check failed; restoring the previous release." >&2
  rollback
  exit 1
fi

echo "Rumia release active: $target_dir"
