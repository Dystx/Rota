import { NextResponse, type NextRequest } from "next/server";

export type AppRole = "admin" | "reviewer" | "traveler";
export type TrustedAppRole = AppRole | "none";

export type ValidatedAuthClaims = {
  app_metadata?: unknown;
};

type RouteAccess =
  | {
      kind: "public";
    }
  | {
      actor: AppRole;
      kind: "authenticated";
      roles?: AppRole[];
    };

const protectedPagePrefixes: Array<{ actor: AppRole; prefix: string }> = [
  { actor: "reviewer", prefix: "/reviewer" },
  { actor: "admin", prefix: "/admin" }
];

const protectedApiPrefixes: Array<{ actor: AppRole; prefix: string }> = [
  { actor: "reviewer", prefix: "/api/reviewer-assignments" },
  { actor: "admin", prefix: "/api/places" },
  { actor: "admin", prefix: "/api/regions" },
  { actor: "admin", prefix: "/api/partners" },
  { actor: "admin", prefix: "/api/reviewers" }
];

export function getRouteAccess(pathname: string): RouteAccess {
  const apiMatch = protectedApiPrefixes.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (apiMatch) {
    return {
      actor: apiMatch.actor,
      kind: "authenticated",
      roles: [apiMatch.actor]
    };
  }

  const pageMatch = protectedPagePrefixes.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (pageMatch) {
    return {
      actor: pageMatch.actor,
      kind: "authenticated",
      roles: [pageMatch.actor]
    };
  }

  return { kind: "public" };
}

export function isProtectedRoute(pathname: string) {
  return getRouteAccess(pathname).kind === "authenticated";
}

export function getTrustedAppRole(claims: ValidatedAuthClaims): TrustedAppRole {
  const metadata = claims.app_metadata;
  const role = metadata && typeof metadata === "object" && "role" in metadata ? metadata.role : null;

  return role === "admin" || role === "reviewer" || role === "traveler" || role === "none" ? role : "none";
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

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  if (!claims) {
    return isApiRoute ? createUnauthorizedJsonResponse() : createAuthRequiredRedirect(request);
  }

  if (access.roles?.length) {
    const role = getTrustedAppRole(claims);

    if (role === "none" || !access.roles.includes(role)) {
      return isApiRoute ? createForbiddenJsonResponse() : createForbiddenPageResponse();
    }
  }

  return null;
}
