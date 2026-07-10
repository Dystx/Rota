import { NextResponse, type NextRequest } from "next/server";

export type ValidatedAuthClaims = {
  app_metadata?: unknown;
};

type RouteAccess =
  | {
      kind: "public";
    }
  | {
      kind: "authenticated";
    };

const protectedPagePrefixes = [
  "/account",
  "/checkout",
  "/console",
  "/guide",
  "/itineraries",
  "/reviewer",
  "/admin",
  "/trip",
  "/vault"
];

export function getRouteAccess(pathname: string): RouteAccess {
  const pageMatch = protectedPagePrefixes.find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (pageMatch) {
    return { kind: "authenticated" };
  }

  return { kind: "public" };
}

export function isProtectedRoute(pathname: string) {
  return getRouteAccess(pathname).kind === "authenticated";
}

export function createAuthRequiredRedirect(request: NextRequest) {
  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(signInUrl, 307);
}

export function createUnauthorizedJsonResponse() {
  return NextResponse.json({ error: { code: "unauthenticated", message: "Authentication required." } }, { status: 401 });
}

export function createForbiddenJsonResponse() {
  return NextResponse.json({ error: { code: "forbidden", message: "Forbidden." } }, { status: 403 });
}

export function createForbiddenPageResponse() {
  return new NextResponse("Forbidden", { status: 403 });
}

export function requireRouteAccess(request: NextRequest, claims: ValidatedAuthClaims | null) {
  const access = getRouteAccess(request.nextUrl.pathname);

  if (access.kind === "public") {
    return null;
  }

  if (!claims) return createAuthRequiredRedirect(request);

  return null;
}
