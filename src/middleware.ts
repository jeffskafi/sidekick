import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  // Log the request method and URL
  console.log(`Request: ${req.method} ${req.url}`);

  // Log all headers
  console.log('Headers:');
  req.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  const publicPaths = ["/", "/sign-in", "/sign-up", "/privacy"];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);

  // Log the path and whether it's public
  console.log(`Path: ${req.nextUrl.pathname}, Is Public: ${isPublicPath}`);

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const { userId } = auth();

  // Log the userId
  console.log(`User ID: ${userId}`);

  // If the user is not authenticated and trying to access a protected route
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    console.log(`Redirecting to: ${signInUrl.toString()}`);
    return NextResponse.redirect(signInUrl.toString());
  }

  // Allow authenticated users to access protected routes
  console.log('Allowing access to protected route');
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};