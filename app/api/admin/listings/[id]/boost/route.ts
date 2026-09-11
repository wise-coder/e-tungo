import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { confirmListingBoost, getListingById } from "@/lib/db";
import { getAdminEmailFromCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(
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

  const boosted = await confirmListingBoost(id);
  return NextResponse.json({ ok: true, boosted });
}

