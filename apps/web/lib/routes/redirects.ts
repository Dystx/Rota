export function resolveLegacyRedirect(pathname: string): { destination: string; status: 308 } | null {
  if (pathname === "/plan") return { destination: "/planner", status: 308 };
  if (pathname === "/human-review") return { destination: "/local-expertise", status: 308 };
  return null;
}
