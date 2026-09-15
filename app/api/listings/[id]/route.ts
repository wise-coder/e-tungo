import { NextResponse } from "next/server";
import { deleteListing, getListingById, updateListing } from "@/lib/db";
import { AuthError, authRoute, jsonBody, requireUser, sessionIdentity, cookieToken } from "@/lib/auth";
import { listingUpdates } from "@/lib/profile-validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  return authRoute(async req => {
    const record = await getListingById((await params).id);
    if (!record) throw new AuthError(404, "Not found.");
    if (record.status === "hidden") {
      const identity = await sessionIdentity(cookieToken(req));
      if (!identity || (!identity.admin && identity.user.id !== record.sellerId)) throw new AuthError(404, "Not found.");
    }
    return NextResponse.json(record);
  })(request);
}
export async function PATCH(request: Request, { params }: Context) {
  return authRoute(async req => {
    const user = await requireUser(req);
    const { id } = await params;
    const record = await getListingById(id);
    if (!record || record.sellerId !== user.id) throw new AuthError(404, "Not found.");
    return NextResponse.json(await updateListing(id, listingUpdates(await jsonBody(req))));
  })(request);
}
export async function DELETE(request: Request, { params }: Context) {
  return authRoute(async req => {
    const user = await requireUser(req);
    const { id } = await params;
    const record = await getListingById(id);
    if (!record || record.sellerId !== user.id) throw new AuthError(404, "Not found.");
    await deleteListing(id);
    return NextResponse.json({ ok: true });
  })(request);
}
