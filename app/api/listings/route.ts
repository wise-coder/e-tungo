import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createListing, getBootstrapData, getListingsBySellerId } from "@/lib/db";
import { AuthError, authRoute, jsonBody, requireUser } from "@/lib/auth";
import { listingUpdates } from "@/lib/profile-validation";
import { normalizeRwandaMobile } from "@/lib/phone";
import type { Listing } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = authRoute(async request => {
  if (new URL(request.url).searchParams.has("sellerId")) {
    const user = await requireUser(request);
    return NextResponse.json(await getListingsBySellerId(user.id));
  }
  return NextResponse.json((await getBootstrapData()).listings.filter(listing => listing.status !== "hidden"));
});
export const POST = authRoute(async request => {
  const user = await requireUser(request);
  const contactPhone = normalizeRwandaMobile(user.phone);
  if (!contactPhone) throw new AuthError(400, "Add a valid mobile number to your profile before posting a listing.");
  const fields = listingUpdates(await jsonBody(request), true);
  const record = { ...fields, id: randomUUID(), sellerId: user.id, sellerName: user.name,
    sellerPhone: contactPhone, sellerDistrict: user.district, postedAt: new Date().toISOString(), sellerEmail: user.email, sellerPhoneVerified: user.phoneVerified, status: "active", views: 0, images: fields.images ?? [] } as Listing;
  return NextResponse.json(await createListing(record), { status: 201 });
});
