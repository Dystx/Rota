import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // Better Auth sessions are verified at the server page/API boundary. The
  // proxy intentionally performs no cookie refresh or database access so an
  // edge request cannot become an alternate authorization path.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)"]
};
