#!/usr/bin/env bash
set -euo pipefail

readonly backup_env=/etc/rumia/backup.env
readonly backup_dir=/var/lib/rumia/backups

if [[ $EUID -ne 0 ]]; then
  echo "backup-rumia.sh must run as root." >&2
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

if [[ ! -r $RESTIC_PASSWORD_FILE ]]; then
  echo "RESTIC_PASSWORD_FILE is not readable." >&2
  exit 1
fi

umask 077
install -d -o root -g root -m 0700 "$backup_dir"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
dump="$backup_dir/rumia-$stamp.dump"

cleanup() {
  rm -f "$dump"
}
trap cleanup EXIT

# Root opens the protected staging file; pg_dump runs under the database OS role.
sudo -u postgres pg_dump --format=custom --no-owner --no-privileges rumia > "$dump"
restic backup --tag rumia-postgres "$dump"
restic forget --keep-daily 14 --keep-weekly 8 --keep-monthly 12 --prune
