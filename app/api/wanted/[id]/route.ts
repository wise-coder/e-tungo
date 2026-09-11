import { NextResponse } from "next/server";
import { deleteWantedRequest, getWantedRequestById, updateWantedRequest } from "@/lib/db";
import type { WantedRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const request = await getWantedRequestById(id);
  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(request);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updates = (await request.json()) as Partial<WantedRequest>;
  const wantedRequest = await updateWantedRequest(id, updates);
  if (!wantedRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(wantedRequest);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  await deleteWantedRequest(id);
  return NextResponse.json({ ok: true });
}
