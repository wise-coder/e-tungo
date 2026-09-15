import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { AuthError, authRoute, cookieToken, rateLimit, requireUser, sessionIdentity } from "@/lib/auth";
import { getListingById } from "@/lib/db";
import { isSaved, recordEngagement, toggleSave, type EngagementAction } from "@/lib/engagement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const VISITOR_COOKIE = "e_tungo_visitor";

function visitor(request: Request) {
  const value = request.headers.get("cookie")?.split(";").map(part => part.trim())
    .find(part => part.startsWith(`${VISITOR_COOKIE}=`))?.slice(VISITOR_COOKIE.length + 1);
  return value && /^[a-f0-9-]{36}$/.test(value) ? value : randomUUID();
}

export async function GET(request: Request, { params }: Context) {
  return authRoute(async req => {
    const { id } = await params;
    const identity = await sessionIdentity(cookieToken(req));
    const listing = await getListingById(id);
    if (!listing || listing.status === "hidden") throw new AuthError(404, "Listing not found.");
    return NextResponse.json({ saved: identity ? await isSaved(id, identity.user.id) : false });
  })(request);
}

export async function POST(request: Request, { params }: Context) {
  return authRoute(async req => {
    const { id } = await params;
    const listing = await getListingById(id);
    if (!listing || listing.status === "hidden" || listing.status === "expired") throw new AuthError(404, "Listing not found.");
    const body = await req.json() as { action?: unknown };
    if (body.action === "save") {
      const user = await requireUser(req);
      const saved = await toggleSave(id, user.id);
      const updated = await getListingById(id);
      return NextResponse.json({ saved, listing: updated });
    }
    if (!["view", "call", "whatsapp", "share"].includes(String(body.action))) throw new AuthError(400, "Invalid action.");
    const action = body.action as EngagementAction;
    const key = visitor(req);
    await rateLimit(`listing:${id}:${key}:${action}`, action === "view" ? 60 : 30);
    await recordEngagement(id, key, action);
    const response = NextResponse.json({ listing: await getListingById(id) });
    response.cookies.set(VISITOR_COOKIE, key, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      path: "/", maxAge: 365 * 24 * 60 * 60,
    });
    return response;
  })(request);
}
