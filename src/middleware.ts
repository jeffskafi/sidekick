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

  // Check if the request is from OpenAI and set the redirect URL accordingly
  if (req.headers.get("referer")?.includes("openai.com")) {
    signInUrl.href = process.env.OPENAI_CHATGPT_REDIRECT_URL!;
  }

  return NextResponse.redirect(signInUrl);
}

  // Allow authenticated users to access protected routes
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};