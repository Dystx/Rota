import { ConfigValidationError } from "@repo/config";
import { type NextRequest, NextResponse } from "next/server";
import { requireRouteAccess, isProtectedRoute } from "@/lib/auth/routes";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    const { claims, response } = await refreshSupabaseSession(request);
    const authResponse = requireRouteAccess(request, claims);

    return authResponse ?? response;
  } catch (error) {
    if (error instanceof ConfigValidationError && !isProtectedRoute(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    throw error;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)"]
};
