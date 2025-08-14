import { NextResponse } from "next/server";
import { verifyTokenEdge } from "./lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log("🚀 Middleware running for:", pathname);

  // Public routes
  const publicRoutes = ["/", "/login", "/register"];
  if (publicRoutes.includes(pathname)) {
    console.log("✅ Public route, allowing access");
    return NextResponse.next();
  }

  // Get token from cookies or headers
  const cookieToken = request.cookies.get("authToken")?.value;
  const headerToken = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");
  const token = cookieToken || headerToken;

  console.log("🍪 Cookie token exists:", !!cookieToken);
  console.log("📋 Header token exists:", !!headerToken);
  console.log("🎫 Final token exists:", token);

  if (!token) {
    console.log("❌ No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    console.log("🔍 Verifying token...");
    const result = await verifyTokenEdge(token);

    console.log("✅ Token verification result:", result.success);

    if (!result.success) {
      console.log("❌ Token invalid, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log("✅ Token valid, allowing access");
    return NextResponse.next();
  } catch (error) {
    console.log("❌ Token verification error:", error.message);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
