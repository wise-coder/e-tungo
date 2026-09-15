import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserById((await params).id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { id, name, district, userType, profileImage, bio, phone, phoneVerified } = user;
  return NextResponse.json({ id, name, district, userType, profileImage, bio, phone, phoneVerified });
}
