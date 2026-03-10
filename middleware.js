import { NextResponse } from "next/server";
import { getFrontendOrigin } from "@/lib/api";

function corsHeaders() {
  const origin = getFrontendOrigin();

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function middleware(req) {
  const headers = corsHeaders();

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  const res = NextResponse.next();

  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
