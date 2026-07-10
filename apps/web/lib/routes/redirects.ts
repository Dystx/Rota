export function resolveLegacyRedirect(pathname: string): { destination: string; status: 308 } | null {
  return pathname === "/plan" ? { destination: "/planner", status: 308 } : null;
}
