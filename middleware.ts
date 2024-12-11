import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/token";

const publicPages = ["/"];

const publicApiRoutes = [
  "/api/auth/sign-in",
  "/api/auth/sign-up",
  "/api/auth/sign-out",
];

const protectedPagePatterns = ["/dashboard", "/dashboard/groups/:path*"];

const protectedApiPatterns = ["/api/groups/:path*"];

function matchDynamicPattern(path: string, pattern: string) {
  const pathParts = path.split("/");
  const patternParts = pattern.split("/");

  if (pathParts.length !== patternParts.length && !pattern.includes("*")) {
    return false;
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart === "*" || patternPart === ":path*") {
      return true;
    }

    if (patternPart.startsWith(":")) {
      continue;
    }

    if (patternPart !== pathPart) {
      return false;
    }
  }

  return true;
}

function isProtectedRoute(path: string): boolean {
  return (
    protectedPagePatterns.some((pattern) =>
      matchDynamicPattern(path, pattern)
    ) ||
    protectedApiPatterns.some((pattern) => matchDynamicPattern(path, pattern))
  );
}

function isPublicRoute(path: string): boolean {
  return publicPages.includes(path) || publicApiRoutes.includes(path);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (isProtectedRoute(path)) {
    if (!token) {
      if (path.startsWith("/api/")) {
        return NextResponse.json(
          { message: "Unauthorized", data: {} },
          { status: 401 }
        );
      }
      return NextResponse.redirect(
        new URL(`/?callbackUrl=${encodeURIComponent(path)}`, request.url)
      );
    }

    try {
      const payload = await verifyToken(token);
      if (!payload?.id) {
        if (path.startsWith("/api/")) {
          return NextResponse.json(
            { message: "Unauthorized", data: {} },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL("/", request.url));
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("user-id", payload.id as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      if (path.startsWith("/api/")) {
        return NextResponse.json(
          { message: "Unauthorized", data: {} },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isPublicRoute(path)) {
    if (token) {
      try {
        const payload = await verifyToken(token);
        if (payload?.id) {
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set("user-id", payload.id as string);
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
      } catch {}
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
