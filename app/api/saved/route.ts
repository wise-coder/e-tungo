import { NextResponse } from "next/server";
import { authRoute, requireUser } from "@/lib/auth";
import { getBootstrapData } from "@/lib/db";
import { savedListingIds } from "@/lib/engagement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = authRoute(async request => {
  const user = await requireUser(request);
  const ids = await savedListingIds(user.id);
  const listings = (await getBootstrapData()).listings;
  const byId = new Map(listings.filter(listing => listing.status === "active").map(listing => [listing.id, listing]));
  return NextResponse.json(ids.map(id => byId.get(id)).filter(Boolean));
});
