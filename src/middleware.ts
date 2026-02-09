import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  // Skip auth if env vars are not set
  if (!user || !pass) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const expected = btoa(`${user}:${pass}`);
    const provided = authHeader.replace(/^Basic\s+/i, "");
    if (provided === expected) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.json).*)",
  ],
};
