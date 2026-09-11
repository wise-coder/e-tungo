import { NextResponse } from "next/server";
import { createWantedRequest, getBootstrapData } from "@/lib/db";
import type { WantedRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json((await getBootstrapData()).wantedRequests);
}

export async function POST(request: Request) {
  const wantedRequest = (await request.json()) as WantedRequest;
  const created = await createWantedRequest(wantedRequest);
  return NextResponse.json(created, { status: 201 });
}
