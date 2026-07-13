#!/usr/bin/env bash
set -euo pipefail

readonly backup_env=/etc/rumia/backup.env
readonly restore_db=rumia_restore_check

if [[ $EUID -ne 0 ]]; then
  echo "restore-rumia-check.sh must run as root." >&2
  exit 1
fi

if [[ ! -r $backup_env ]]; then
  echo "Missing backup configuration: $backup_env" >&2
  exit 1
fi

# shellcheck source=/etc/rumia/backup.env
set -a
source "$backup_env"
set +a
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY is required}"
: "${RESTIC_PASSWORD_FILE:?RESTIC_PASSWORD_FILE is required}"

if sudo -u postgres psql -d postgres -Atqc "select 1 from pg_database where datname = '$restore_db'" | grep -qx 1; then
  echo "Refusing to overwrite existing database: $restore_db" >&2
  exit 1
fi

restore_dir=$(mktemp --directory /var/tmp/rumia-restore.XXXXXX)
cleanup() {
  sudo -u postgres dropdb --if-exists "$restore_db" >/dev/null 2>&1 || true
  rm -rf "$restore_dir"
}
trap cleanup EXIT

restic restore latest --tag rumia-postgres --target "$restore_dir"
dump=$(find "$restore_dir" -type f -name 'rumia-*.dump' -print -quit)
if [[ -z $dump ]]; then
  echo "No Rumia PostgreSQL dump found in the restored snapshot." >&2
  exit 1
fi

# Restic restores as root, while pg_restore runs as the postgres OS user.
# Hand the temporary tree to postgres so it can traverse and read the dump.
chown -R postgres:postgres "$restore_dir"

sudo -u postgres createdb -T template0 "$restore_db"
sudo -u postgres pg_restore --exit-on-error --dbname="$restore_db" "$dump"
sudo -u postgres psql -d "$restore_db" -Atqc 'select postgis_full_version()'
