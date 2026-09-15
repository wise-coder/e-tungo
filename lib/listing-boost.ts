import type { Listing } from "./types";

const BOOST_DURATION_DAYS = 7;

export function isBoostActive(listing: Pick<Listing, "boostedAt" | "boostExpiresAt">) {
  if (!listing.boostedAt) return false;
  if (!listing.boostExpiresAt) return true;
  return new Date(listing.boostExpiresAt).getTime() > Date.now();
}

export const isListingBoostActive = isBoostActive;

export function isFeaturedActive(listing: Listing) {
  return Boolean(listing.featuredAt && (!listing.featureExpiresAt || new Date(listing.featureExpiresAt).getTime() > Date.now()));
}

export function isTrending(listing: Listing) {
  return listing.status === "active" && (listing.trendingScore ?? 0) >= 10;
}

export function getBoostScore(listing: Listing) {
  if (!isBoostActive(listing)) return 0;

  const boostedAt = new Date(listing.boostedAt ?? listing.postedAt).getTime();
  const viewedBoost = listing.views * 1_000;
  return 1_000_000_000_000 + boostedAt + viewedBoost;
}

export function sortListingsForMarket(listings: Listing[]) {
  return [...listings].sort((a, b) => {
    const priority = (listing: Listing) => isFeaturedActive(listing) ? 4 : isBoostActive(listing) ? 3 : isTrending(listing) ? 2 : 1;
    const priorityDelta = priority(b) - priority(a);
    if (priorityDelta) return priorityDelta;
    if (isTrending(a) && isTrending(b) && (b.trendingScore ?? 0) !== (a.trendingScore ?? 0))
      return (b.trendingScore ?? 0) - (a.trendingScore ?? 0);

    const postedDelta = new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    if (postedDelta !== 0) return postedDelta;

    return b.views - a.views;
  });
}

export function createBoostExpiry(start = new Date(), days = BOOST_DURATION_DAYS) {
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}
