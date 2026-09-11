import { NextResponse } from "next/server";
import {
  ADMIN_EMAIL,
  createAdminSessionToken,
  isAdminEmail,
  isValidAdminPassword,
} from "@/lib/admin-auth";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password || !isAdminEmail(email) || !isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, email: ADMIN_EMAIL });
  const isSecure = new URL(request.url).protocol === "https:";
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionToken(email),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
