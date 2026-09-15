import { NextResponse } from "next/server";
import { getListingById, deleteListing, updateListing } from "@/lib/db";
import { AuthError, authRoute, sessionIdentity, cookieToken, jsonBody } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return authRoute(async req => {
    const identity = await sessionIdentity(cookieToken(req));
    if (!identity?.admin) throw new AuthError(401, "Unauthorized.");
    const { id } = await params;
    const listing = await getListingById(id);
    if (!listing) throw new AuthError(404, "Not found.");
    const body = await jsonBody(req);
    const action = String(body.action ?? "");
    if (["feature", "boost", "recommend"].includes(action) && listing.status !== "active") throw new AuthError(400, "Only active listings can be promoted.");
    const duration = Number(body.durationHours);
    const allowed = [24, 72, 168, 336];
    const now = new Date();
    if (["feature", "boost"].includes(action) && !allowed.includes(duration)) throw new AuthError(400, "Invalid promotion duration.");
    const expiry = allowed.includes(duration) ? new Date(now.getTime() + duration * 3600_000).toISOString() : undefined;
    let updates = {};
    if (action === "feature") updates = { featuredAt: now.toISOString(), featureExpiresAt: expiry };
    else if (action === "boost") updates = { boostedAt: now.toISOString(), boostExpiresAt: expiry };
    else if (action === "recommend") updates = { recommended: true };
    else if (action === "remove-promotion") updates = { featuredAt: undefined, featureExpiresAt: undefined, boostedAt: undefined, boostExpiresAt: undefined, recommended: false };
    else if (action === "sold") updates = { status: "sold" };
    else if (action === "hide") updates = { status: "hidden" };
    else if (action === "show") updates = { status: "active" };
    else throw new AuthError(400, "Invalid admin action.");
    return NextResponse.json(await updateListing(id, updates));
  })(request);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return authRoute(async req => {
    const identity = await sessionIdentity(cookieToken(req));
    if (!identity?.admin) throw new AuthError(401, "Unauthorized.");
    const { id } = await params;
    if (!await getListingById(id)) throw new AuthError(404, "Not found.");
    const result = await deleteListing(id);
    return NextResponse.json({ ok: true });
  })(request);
}
