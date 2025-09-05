import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes
const protectedRoutes = ["/admin", "/dashboard", "/profile", "/settings"];

// Define admin-only routes
const adminRoutes = ["/admin"];

// Define public routes that don't require authentication
const publicRoutes = [
    "/",
    "/blog",
    "/auth/login",
    "/auth/signup",
    "/auth/reset-password",
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".") ||
        pathname.startsWith("/favicon")
    ) {
        return NextResponse.next();
    }

    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        // Check if route requires authentication
        const isProtectedRoute = protectedRoutes.some((route) =>
            pathname.startsWith(route)
        );

        const isAdminRoute = adminRoutes.some((route) =>
            pathname.startsWith(route)
        );

        const isPublicRoute = publicRoutes.some(
            (route) => pathname === route || pathname.startsWith(route)
        );

        // If user is not authenticated and trying to access protected route
        if (!user && isProtectedRoute) {
            const loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // If user is authenticated, check admin routes
        if (user && isAdminRoute) {
            // Get user role from database
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();

            if (userError || !userData || userData.role !== "admin") {
                // Redirect non-admin users away from admin routes
                return NextResponse.redirect(new URL("/", request.url));
            }
        }

        // Allow access to public routes and authenticated users
        return NextResponse.next();
    } catch (error) {
        console.error("Middleware error:", error);

        // On error, redirect to login for protected routes
        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }

        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};
