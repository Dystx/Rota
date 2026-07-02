export interface KillSwitchEnv {
  server?: string | undefined;
  client?: string | undefined;
}

export type KillSwitchSource = "server" | "client" | "off";

// Strict literal match only: "true", "yes", " 1 " are inactive by design.
const ACTIVE_LITERAL = "1";

function readEnv(env: KillSwitchEnv | undefined): KillSwitchEnv {
  if (env) return env;
  const proc = typeof process !== "undefined" ? process : undefined;
  return {
    server: proc?.env?.MAPBOX_KILL_SWITCH,
    client: proc?.env?.NEXT_PUBLIC_MAPBOX_KILL_SWITCH,
  };
}

export function isKillSwitchActive(env?: KillSwitchEnv): boolean {
  const resolved = readEnv(env);
  return resolved.server === ACTIVE_LITERAL || resolved.client === ACTIVE_LITERAL;
}

export function getKillSwitchSource(env?: KillSwitchEnv): KillSwitchSource {
  const resolved = readEnv(env);
  if (resolved.server === ACTIVE_LITERAL) return "server";
  if (resolved.client === ACTIVE_LITERAL) return "client";
  return "off";
}
