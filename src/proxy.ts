import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "token";
const PROTECTED_PREFIXES = ["/dashboard", "/zones", "/products", "/orders"];
const PROTECTED_API = ["/api/zones", "/api/products", "/api/orders", "/api/auth/me"];

function secret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtectedPage = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isProtectedApi = PROTECTED_API.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, secret(), { algorithms: ["HS256"] });
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (valid) return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/zones/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/api/:path*",
  ],
};