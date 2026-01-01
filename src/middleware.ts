import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Check if accessing admin routes
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-access-denied")) {
      // Allow access only if user has ADMIN role
      if (token?.role !== "ADMIN") {
        // Redirect to access denied page for non-admin users
        return NextResponse.redirect(new URL("/admin-access-denied", req.url));
      }
    }

    // Check API admin routes
    if (pathname.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Protected routes that require authentication
        const protectedRoutes = ["/admin", "/user-dashboard"];
        const protectedApiRoutes = ["/api/admin"];
        
        // Check if it's a protected page route
        const isProtectedPageRoute = protectedRoutes.some((route) =>
          pathname.startsWith(route) && !pathname.startsWith("/admin-access-denied")
        );
        
        // Check if it's a protected API route
        const isProtectedApiRoute = protectedApiRoutes.some((route) =>
          pathname.startsWith(route)
        );

        // If accessing a protected route, require a token
        if (isProtectedPageRoute || isProtectedApiRoute) {
          return !!token;
        }

        // Allow access to all other routes
        return true;
      },
    },
    pages: {
      signIn: "/sign-in",
    },
  }
);

export const config = {
  matcher: [
    // Only match protected routes, exclude auth routes and static files
    "/admin/:path*",
    "/user-dashboard/:path*",
    "/api/admin/:path*",
  ],
};