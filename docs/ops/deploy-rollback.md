# Rumia deployment and rollback

Rumia is deployed as a versioned standalone Next artifact beside the existing
Lumes service. The deployment wrapper only changes `/opt/apps/rumia/current`
and restarts `rumia-web.service`; it never restarts or rewrites Lumes.

## Release activation

1. Build on the Mac with the PostgreSQL/Better Auth environment.
2. Copy `apps/web/.next/standalone/` into a prepared release directory, then
   place the built browser assets inside the nested standalone app that owns
   the server process:

   ```text
   apps/web/.next/standalone/apps/web/.next/static/
   apps/web/.next/standalone/apps/web/public/
   ```

   The standalone server changes its working directory to
   `apps/web/.next/standalone/apps/web`; placing assets only beside the
   standalone directory produces an unstyled production page.
3. Upload the directory to the VPS and run:

   ```sh
   sudo /usr/local/sbin/deploy-rumia.sh /var/tmp/rumia-release <git-sha>
   ```

4. The wrapper verifies the standalone server entrypoint and both nested asset
   directories, copies the release atomically, updates `current`, restarts only
   Rumia, and checks
   `http://127.0.0.1:3002/api/health`.

## Application rollback

If the loopback health check fails, the wrapper restores the previous `current`
symlink and restarts only `rumia-web.service`. For a later manual rollback:

```sh
sudo ln -s /opt/apps/rumia/releases/<known-good> /opt/apps/rumia/current.rollback
sudo mv -Tf /opt/apps/rumia/current.rollback /opt/apps/rumia/current
sudo systemctl restart rumia-web.service
curl --fail http://127.0.0.1:3002/api/health
```

## Database policy

Database changes are forward-only. Roll back application code first; do not
destructively downgrade PostgreSQL schema. A corrective migration must be
written, reviewed, applied with the owner role, and verified with the policy
runner before the next release.

## Backup restore gate

The R2/Restic backup and restore procedure is configured and has passed a
successful backup plus `restore-rumia-check.sh` validation. Keep the restore
output and snapshot identity with the cutover record. Do not treat a symlink
rollback as a substitute for database restore evidence; repeat the restore
check after material backup-script changes.
