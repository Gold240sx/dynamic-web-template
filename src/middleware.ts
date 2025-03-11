import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { appConfig } from "./app-config";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId");

  // If authentication is disabled, allow all requests
  if (!appConfig.authentication) {
    return NextResponse.next();
  }

  // Public paths that don't require authentication
  const publicPaths = ["/", "/signin", "/api/auth/signin"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Redirect to sign in if not authenticated
  if (!userId) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
