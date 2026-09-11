import { NextResponse } from "next/server";
import type { User } from "@/lib/types";
import { resolveUserByEmail, upsertUser } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await resolveUserByEmail(email);
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const user = (await request.json()) as User;
  const saved = await upsertUser(user);
  return NextResponse.json(saved);
}
