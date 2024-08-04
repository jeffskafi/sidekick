import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

export default async function middleware(req: NextRequest) {
  const { userId } = getAuth(req);
  const isApiRequest = req.nextUrl.pathname.startsWith('/api/');
  const origin = req.headers.get('origin');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin ?? '') ? origin ?? '' : '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Block API access from browsers
  if (isApiRequest && req.headers.get('sec-fetch-dest') === 'document') {
    return new NextResponse(
      JSON.stringify({ error: "API access from browsers is not allowed" }),
      { 
        status: 403, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigins.includes(origin ?? '') ? origin ?? '' : '',
        } 
      }
    );
  }

  // For API requests, authenticate the request
  if (isApiRequest) {
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigins.includes(origin ?? '') ? origin ?? '' : '',
          } 
        }
      );
    }

    // If authentication succeeds, you can proceed with the request
    // Pass the userId along with the request using headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-User-Id', userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For non-API requests, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};