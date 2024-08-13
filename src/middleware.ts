import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  console.log("auth", auth);
  const publicPaths = ["/", "/sign-in", "/sign-up", "/privacy"];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);
  console.log("isPublicPath", isPublicPath);
  console.log("req.nextUrl.pathname", req.nextUrl.pathname);
  console.log("req.url", req.url);
  console.log("req.method", req.method);
  console.log("req.headers", req.headers);
  console.log("req.body", req.body);
  console.log("req.cookies", req.cookies);
  console.log("req.nextUrl", req.nextUrl);
  console.log("req.nextUrl.origin", req.nextUrl.origin);
  console.log("req.nextUrl.pathname", req.nextUrl.pathname);
  console.log("req.nextUrl.searchParams", req.nextUrl.searchParams);

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const authObject = auth();
  console.log("authObject", authObject);
  const userId = authObject.userId;
  console.log("userId", userId);

  // If the user is not authenticated and trying to access a protected route
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    console.log("signInUrl", signInUrl);
    signInUrl.searchParams.set("redirect_url", req.url);
    console.log("signInUrl", signInUrl);
    return NextResponse.redirect(signInUrl);
  }

  // Allow authenticated users to access protected routes
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
