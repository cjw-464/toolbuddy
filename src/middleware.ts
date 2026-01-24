import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutes = ["/tools", "/friends", "/profile"];
const authRoutes = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
	const { user, supabaseResponse } = await updateSession(request);
	const { pathname } = request.nextUrl;

	// Check if user is trying to access a protected route without being authenticated
	const isProtectedRoute = protectedRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);

	if (isProtectedRoute && !user) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirectTo", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Check if authenticated user is trying to access auth routes
	const isAuthRoute = authRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`)
	);

	if (isAuthRoute && user) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return supabaseResponse;
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
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
