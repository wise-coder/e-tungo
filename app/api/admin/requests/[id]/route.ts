import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteWantedRequest, getWantedRequestById } from "@/lib/db";
import { getAdminEmailFromCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const adminEmail = getAdminEmailFromCookies(cookies());
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const request = await getWantedRequestById(id);
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  await deleteWantedRequest(id);
  return NextResponse.json({ ok: true });
}

