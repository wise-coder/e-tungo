import { NextResponse } from "next/server";
import { getBootstrapData } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getBootstrapData());
}
