import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((req) => {
  const { userId, sessionId, getToken } = getAuth(req);

  // Log the request method and URL
  console.log(`Request: ${req.method} ${req.url}`);

  // Log all headers
  console.log('Headers:');
  req.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  // Log cookies
  console.log('Cookies:');
  req.cookies.getAll().forEach(cookie => {
    console.log(`${cookie.name}: ${cookie.value}`);
  });

  // Try to get the session token
  getToken().then(token => {
    console.log('Session Token:', token);
  }).catch(error => {
    console.error('Error getting session token:', error);
  });

  const publicPaths = ["/", "/sign-in", "/sign-up", "/privacy"];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);
  const isApiPath = req.nextUrl.pathname.startsWith('/api/');

  // Log the path and whether it's public or API
  console.log(`Path: ${req.nextUrl.pathname}, Is Public: ${isPublicPath}, Is API: ${isApiPath}`);

  // Allow access to public paths and API routes
  if (isPublicPath || isApiPath) {
    return NextResponse.next();
  }

  // Log the userId and sessionId
  console.log(`User ID: ${userId}, Session ID: ${sessionId}`);

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