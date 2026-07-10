export function resolveLegacyRedirect(pathname: string): { destination: string; status: 308 } | null {
  if (pathname === "/plan" || pathname === "/explore/workspace") return { destination: "/planner", status: 308 };
  if (pathname === "/explore") return { destination: "/portugal", status: 308 };
  return null;
}
