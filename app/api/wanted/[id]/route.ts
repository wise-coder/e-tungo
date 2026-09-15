import { NextResponse } from "next/server";
import { deleteWantedRequest, getWantedRequestById, updateWantedRequest } from "@/lib/db";
import { AuthError, authRoute, jsonBody, requireUser } from "@/lib/auth";
import { wantedUpdates } from "@/lib/profile-validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  return authRoute(async () => {
    const record = await getWantedRequestById((await params).id);
    if (!record) throw new AuthError(404, "Not found.");
    return NextResponse.json(record);
  })(request);
}
export async function PATCH(request: Request, { params }: Context) {
  return authRoute(async req => {
    const user = await requireUser(req);
    const { id } = await params;
    const record = await getWantedRequestById(id);
    if (!record || record.buyerId !== user.id) throw new AuthError(404, "Not found.");
    return NextResponse.json(await updateWantedRequest(id, wantedUpdates(await jsonBody(req))));
  })(request);
}
export async function DELETE(request: Request, { params }: Context) {
  return authRoute(async req => {
    const user = await requireUser(req);
    const { id } = await params;
    const record = await getWantedRequestById(id);
    if (!record || record.buyerId !== user.id) throw new AuthError(404, "Not found.");
    await deleteWantedRequest(id);
    return NextResponse.json({ ok: true });
  })(request);
}
