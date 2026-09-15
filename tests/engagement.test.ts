import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Listing } from "../lib/types";
import { createListing, getListingById, deleteListing } from "../lib/db";
import { recordEngagement, toggleSave, uniqueMarketplaceVisitors } from "../lib/engagement";
import { sortListingsForMarket } from "../lib/listing-boost";

test("real events produce total and unique counts, saves toggle, and recent activity ranks", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "e-tungo-engagement-"));
  process.env.SQLITE_PATH = path.join(dir, "test.sqlite");
  delete process.env.MONGODB_URI;
  const listing: Listing = {
    id: "listing-test", sellerId: "seller-test", sellerName: "Seller", sellerPhone: "+250700000000",
    sellerPhoneVerified: false, sellerDistrict: "Huye", category: "cattle", title: "Cow",
    price: 100, district: "Huye", images: [], status: "active", views: 0,
    postedAt: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
  };
  try {
    await createListing(listing);
    await recordEngagement(listing.id, "visitor-a", "view");
    await recordEngagement(listing.id, "visitor-a", "view");
    await recordEngagement(listing.id, "visitor-b", "view");
    await recordEngagement(listing.id, "visitor-a", "call");
    await recordEngagement(listing.id, "visitor-a", "whatsapp");
    await recordEngagement(listing.id, "visitor-b", "share");
    assert.equal(await toggleSave(listing.id, "buyer-a"), true);
    const first = await getListingById(listing.id);
    assert.equal(first?.views, 3);
    assert.equal(first?.uniqueViews, 2);
    assert.equal(first?.calls, 1);
    assert.equal(first?.whatsappClicks, 1);
    assert.equal(first?.shares, 1);
    assert.equal(first?.saves, 1);
    assert.equal(await uniqueMarketplaceVisitors(), 2);
    const newest = { ...listing, id: "newest", postedAt: new Date().toISOString(), trendingScore: 0 };
    const boosted = { ...newest, id: "boosted", boostedAt: new Date().toISOString(), boostExpiresAt: new Date(Date.now() + 24 * 3600_000).toISOString() };
    const featured = { ...newest, id: "featured", featuredAt: new Date().toISOString(), featureExpiresAt: new Date(Date.now() + 24 * 3600_000).toISOString() };
    assert.deepEqual(sortListingsForMarket([newest, first!, boosted, featured]).map(item => item.id),
      ["featured", "boosted", listing.id, "newest"]);
    assert.equal(await toggleSave(listing.id, "buyer-a"), false);
    assert.equal((await getListingById(listing.id))?.saves, 0);
    await deleteListing(listing.id);
    assert.equal(await uniqueMarketplaceVisitors(), 0);
  } finally {
    globalThis.__eTungoDb?.close();
    globalThis.__eTungoDb = undefined;
    rmSync(dir, { recursive: true, force: true });
  }
});
