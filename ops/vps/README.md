# Rumia VPS operations

These are deployment assets for the existing Debian 13 VPS. They are deliberately independent of Lumes: Rumia uses its own Unix account, PostgreSQL database roles, loopback-only port (`127.0.0.1:3002`), Caddy fragment, directories, and service units. Do not install Docker or Podman.

## Current host baseline

- Caddy is the sole public ingress; UFW permits only SSH, HTTP, and HTTPS.
- Lumes remains native and is not restarted, reconfigured, or moved by these assets.
- Rumia uses the verified Node runtime at `/opt/node-v24.18.0/bin/node`; do not replace Debian's Node 22 or add a global Node symlink.
- PostgreSQL 17 listens only on `127.0.0.1:5432` and uses SCRAM authentication for host connections.
- Database roles are separate: `rumia_owner` performs migrations; `rumia_app` is the restricted runtime identity.

## Deployment order

1. Build and test Rumia on the Mac.
2. Upload the prepared artifact to the VPS and run `deploy-rumia.sh <artifact> <release-id>`. The artifact must include the standalone server and its nested browser assets at `apps/web/.next/standalone/apps/web/.next/static/` and `apps/web/.next/standalone/apps/web/public/`; the wrapper validates these paths before activation. It copies the artifact into `/opt/apps/rumia/releases/<release-id>`, atomically updates `current`, restarts only `rumia-web.service`, and rolls back the symlink if the loopback health check fails.
3. Create `/etc/rumia/web.env` as `root:root` mode `0600`. It must contain `DATABASE_URL` for `rumia_app`, `BETTER_AUTH_SECRET`, and only the server-side integration variables enabled for this release. Never add `NEXT_PUBLIC_*` database credentials.
4. Copy `rumia-web.service` to `/etc/systemd/system/`, run `systemctl daemon-reload`, then enable and start only `rumia-web`. Confirm `curl -fsS http://127.0.0.1:3002/api/health` before public routing.
5. After DNS resolves for both domains and the loopback check passes, copy `rumia.caddy` into the Caddy include path, validate the full Caddy configuration, and reload Caddy. Do not restart Lumes.
6. Install and enable the worker unit/timer only when a tested worker artifact exists.

## Private access from the Mac

The VPS service is intentionally loopback-only. If local Lumes is already using
Mac port 3002, do not stop or reconfigure it. Open a separate tunnel instead:

```sh
ssh -N -L 3302:127.0.0.1:3002 root@152.53.145.9
```

Then open `http://127.0.0.1:3302`. Mac port 3002 remains Lumes; VPS port 3002
is Rumia.

## Encrypted off-server backups

Cloudflare R2 is configured as a dedicated private bucket with a least-privileged S3 token. `/etc/rumia/backup.env` is `root:root`, `0600`, with `RESTIC_REPOSITORY`, `RESTIC_PASSWORD_FILE`, and the R2 credentials. Keep the Restic password in a separate `root:root`, `0600` file.

Install the two scripts as root-owned executables under `/usr/local/sbin/`. Run one successful `backup-rumia.sh` and `restore-rumia-check.sh` before enabling a systemd timer. The restore check creates and drops only `rumia_restore_check`; it refuses to run if that database already exists.

Do not configure an R2 credential, a Caddy virtual host, a public service, or a worker timer until the required account/DNS/release gate is ready.
