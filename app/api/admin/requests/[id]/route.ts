import { NextResponse } from "next/server";
import { getWantedRequestById, deleteWantedRequest } from "@/lib/db";
import { AuthError, authRoute, sessionIdentity, cookieToken } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return authRoute(async req => {
    const identity = await sessionIdentity(cookieToken(req));
    if (!identity?.admin) throw new AuthError(401, "Unauthorized.");
    const { id } = await params;
    if (!await getWantedRequestById(id)) throw new AuthError(404, "Not found.");
    const result = await deleteWantedRequest(id);
    return NextResponse.json({ ok: true });
  })(request);
}
