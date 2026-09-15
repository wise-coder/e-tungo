import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createWantedRequest, getBootstrapData } from "@/lib/db";
import { authRoute, jsonBody, requireUser } from "@/lib/auth";
import { wantedUpdates } from "@/lib/profile-validation";
import type { WantedRequest } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = authRoute(async request => {

  return NextResponse.json((await getBootstrapData()).wantedRequests);
});
export const POST = authRoute(async request => {
  const user = await requireUser(request);
  const fields = wantedUpdates(await jsonBody(request), true);
  const record = { ...fields, id: randomUUID(), buyerId: user.id, buyerName: user.name,
    buyerPhone: fields.buyerPhone ?? user.phone ?? "", buyerDistrict: fields.buyerDistrict ?? user.district, postedAt: new Date().toISOString(), status: "open" } as WantedRequest;
  return NextResponse.json(await createWantedRequest(record), { status: 201 });
});
