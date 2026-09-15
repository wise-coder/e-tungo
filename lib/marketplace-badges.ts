import type { Listing } from "./types";
import { isFeaturedActive, isTrending } from "./listing-boost";

export function listingBadges(listing: Listing): string[] {
  if (listing.status === "sold") return ["Sold"];
  const badges: string[] = [];
  if (isFeaturedActive(listing)) badges.push("Featured");
  else if (isTrending(listing)) badges.push("Trending");
  if (listing.recommended) badges.push("Recommended");
  if (badges.length < 2 && Date.now() - new Date(listing.postedAt).getTime() < 3 * 24 * 3600_000) badges.push("New");
  return badges.slice(0, 2);
}
