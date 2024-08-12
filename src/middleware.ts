import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const publicPaths = ["/", "/sign-in", "/sign-up", "/privacy", "/api/auth/callback/clerk"];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const everythingAuthenticated = auth();
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('everythingAuthenticated', JSON.stringify(everythingAuthenticated, null, 2));
  const userId = everythingAuthenticated.userId;

  // If the user is not authenticated and trying to access a protected route
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Allow authenticated users to access protected routes
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};