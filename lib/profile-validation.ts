import "server-only";
import { AuthError } from "./auth";
import type { Listing, User, WantedRequest } from "./types";
import { normalizeRwandaMobile } from "./phone";

function text(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new AuthError(400, "Invalid field value.");
  return value.trim();
}
function imageUrl(value: unknown) {
  const url = text(value, 1_500_000);
  if (url && !/^https:\/\//i.test(url) && !/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(url)) throw new AuthError(400, "Invalid image.");
  return url;
}
export function profileUpdates(body: Record<string, unknown>, user: User): User {
  const next = { ...user };
  for (const field of ["name", "district", "bio"] as const) {
    if (body[field] !== undefined) next[field] = text(body[field], field === "bio" ? 2000 : 100, field === "name" || field === "district");
  }
  if (body.phone !== undefined) {
    const raw = text(body.phone, 100);
    if (raw) {
      const normalized = normalizeRwandaMobile(raw);
      if (!normalized) throw new AuthError(400, "Enter a valid Rwanda mobile number.");
      next.phone = normalized;
    } else next.phone = undefined;
  }
  if (body.profileImage !== undefined) next.profileImage = imageUrl(body.profileImage);
  if (body.userType !== undefined) {
    if (!["farmer", "buyer", "business"].includes(String(body.userType))) throw new AuthError(400, "Invalid user type.");
    next.userType = body.userType as User["userType"];
  }
  if (next.phone !== user.phone) next.phoneVerified = false;
  return next;
}
const categories = ["cattle", "goats", "sheep", "pigs", "chickens", "rabbits", "fish", "milk", "eggs", "honey", "other"];
const listingText = ["title", "district", "sector", "priceUnit", "breed", "sex", "age", "weight", "milkProduction", "vaccinationStatus", "purpose", "chickenType", "milkAvailability", "description"] as const;
export function listingUpdates(body: Record<string, unknown>, creating = false): Partial<Listing> {
  const next: Record<string, unknown> = {};
  for (const field of listingText) if (body[field] !== undefined) next[field] = text(body[field], field === "description" ? 5000 : 200, field === "title" || field === "district");
  for (const field of ["price", "quantity", "litresAvailable", "traysAvailable"] as const) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "number" || !Number.isFinite(body[field]) || body[field] < 0 || body[field] > 1e12) throw new AuthError(400, "Invalid numeric value.");
      next[field] = body[field];
    }
  }
  if (body.category !== undefined) {
    if (!categories.includes(String(body.category))) throw new AuthError(400, "Invalid category.");
    next.category = body.category;
  }
  if (body.status !== undefined && !creating) {
    if (!["active", "sold", "expired"].includes(String(body.status))) throw new AuthError(400, "Invalid status.");
    next.status = body.status;
  }
  if (body.images !== undefined) {
    if (!Array.isArray(body.images) || body.images.length > 10) throw new AuthError(400, "Invalid images.");
    next.images = body.images.map(imageUrl);
  }
  if (creating && (!next.title || !next.district || !next.category || next.price === undefined)) throw new AuthError(400, "Title, district, category and price are required.");
  return next as Partial<Listing>;
}
export function wantedUpdates(body: Record<string, unknown>, creating = false): Partial<WantedRequest> {
  const next: Record<string, unknown> = {};
  for (const field of ["title", "quantity", "budget", "neededBy", "description", "buyerPhone", "buyerDistrict"] as const) if (body[field] !== undefined) next[field] = text(body[field], field === "description" ? 5000 : 200, field === "title");
  if (body.category !== undefined) {
    if (!categories.includes(String(body.category))) throw new AuthError(400, "Invalid category.");
    next.category = body.category;
  }
  if (body.status !== undefined && !creating) {
    if (!["open", "closed"].includes(String(body.status))) throw new AuthError(400, "Invalid status.");
    next.status = body.status;
  }
  if (creating && (!next.title || !next.category)) throw new AuthError(400, "Title and category are required.");
  return next as Partial<WantedRequest>;
}
