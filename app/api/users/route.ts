import { NextResponse } from "next/server";
import { upsertUser } from "@/lib/db";
import { authRoute, jsonBody, requireUser } from "@/lib/auth";
import { profileUpdates } from "@/lib/profile-validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = authRoute(async request => NextResponse.json(await requireUser(request)));
export const PUT = authRoute(async request => {
  const user = await requireUser(request);
  const saved = await upsertUser(profileUpdates(await jsonBody(request), user));
  return NextResponse.json(saved);
});
