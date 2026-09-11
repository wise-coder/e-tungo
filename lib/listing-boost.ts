import type { Listing } from "./types";

const BOOST_DURATION_DAYS = 7;

export function isBoostActive(listing: Pick<Listing, "boostedAt" | "boostExpiresAt">) {
  if (!listing.boostedAt) return false;
  if (!listing.boostExpiresAt) return true;
  return new Date(listing.boostExpiresAt).getTime() > Date.now();
}

export const isListingBoostActive = isBoostActive;

export function getBoostScore(listing: Listing) {
  if (!isBoostActive(listing)) return 0;

  const boostedAt = new Date(listing.boostedAt ?? listing.postedAt).getTime();
  const viewedBoost = listing.views * 1_000;
  return 1_000_000_000_000 + boostedAt + viewedBoost;
}

export function sortListingsForMarket(listings: Listing[]) {
  return [...listings].sort((a, b) => {
    const boostDelta = getBoostScore(b) - getBoostScore(a);
    if (boostDelta !== 0) return boostDelta;

    const postedDelta = new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    if (postedDelta !== 0) return postedDelta;

    return b.views - a.views;
  });
}

export function createBoostExpiry(start = new Date(), days = BOOST_DURATION_DAYS) {
  return new Date(start.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}
