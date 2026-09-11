import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteListing, getListingById } from "@/lib/db";
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
  const listing = await getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  await deleteListing(id);
  return NextResponse.json({ ok: true });
}

