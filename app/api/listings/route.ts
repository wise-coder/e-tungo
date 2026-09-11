import { NextResponse } from "next/server";
import { createListing, getBootstrapData, getListingsBySellerIdentity } from "@/lib/db";
import type { Listing } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get("sellerId");
  const email = searchParams.get("email")?.trim() || undefined;

  if (sellerId) {
    const listings = await getListingsBySellerIdentity(sellerId, email);
    return NextResponse.json(listings);
  }

  return NextResponse.json((await getBootstrapData()).listings);
}

export async function POST(request: Request) {
  const listing = (await request.json()) as Listing;
  const created = await createListing(listing);
  return NextResponse.json(created, { status: 201 });
}
