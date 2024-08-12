import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const publicPaths = ["/", "/sign-in", "/sign-up", "/privacy"];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const { userId } = auth();

  // If the user is not authenticated and trying to access a protected route
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (req.nextUrl.searchParams.has("redirect_url") && req.nextUrl.searchParams.get("redirect_url") === "https://chat.openai.com/aip/g-9c2125bbe520d137a2dec221c3d0f33187c481c8/oauth/callback") {
    return NextResponse.redirect(req.nextUrl.searchParams.get("redirect_url")!);
  }

  // Allow authenticated users to access protected routes
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};