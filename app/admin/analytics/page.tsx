import Link from "next/link";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";
import { uniqueMarketplaceVisitors } from "@/lib/engagement";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

function RankedListings({ title, listings, value }: { title: string; listings: Listing[]; value: (listing: Listing) => string }) {
  return <section className="rounded-[24px] border border-[#e6dfd5] bg-white p-5">
    <h2 className="text-lg font-black text-[#262424]">{title}</h2>
    <div className="mt-3 space-y-2">{listings.length ? listings.slice(0, 5).map(listing =>
      <Link key={listing.id} href={`/listing/${listing.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#f0ebe4] px-3 py-2 text-sm hover:bg-[#faf8f4]">
        <span className="truncate font-semibold text-[#262424]">{listing.title}</span><span className="shrink-0 text-[#6f655c]">{value(listing)}</span>
      </Link>) : <p className="text-sm text-[#6f655c]">No listings yet.</p>}</div>
  </section>;
}

function RankedPlaces({ title, values }: { title: string; values: string[] }) {
  const counts = new Map<string, number>();
  values.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
  return <section className="rounded-[24px] border border-[#e6dfd5] bg-white p-5"><h2 className="text-lg font-black text-[#262424]">{title}</h2>
    <div className="mt-3 space-y-2">{[...counts].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) =>
      <p key={name} className="flex justify-between rounded-xl border border-[#f0ebe4] px-3 py-2 text-sm"><span>{name}</span><strong>{count} active</strong></p>)}</div></section>;
}

export default async function MarketplaceAnalyticsPage() {
  const { listings, activeListings, soldListings } = await loadAdminDashboardData();
  const uniqueVisitors = await uniqueMarketplaceVisitors();
  const sum = (field: "views" | "saves" | "calls" | "whatsappClicks" | "shares") => listings.reduce((total, listing) => total + (listing[field] ?? 0), 0);
  const metric = [
    ["Listing views", sum("views")], ["Unique visitors", uniqueVisitors], ["Saves", sum("saves")],
    ["Calls", sum("calls")], ["WhatsApp clicks", sum("whatsappClicks")], ["Shares", sum("shares")],
    ["Active listings", activeListings.length], ["Sold listings", soldListings.length],
  ] as const;
  const sorted = (score: (listing: Listing) => number) => [...listings].sort((a, b) => score(b) - score(a));
  const contacts = (listing: Listing) => (listing.calls ?? 0) + (listing.whatsappClicks ?? 0);
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a8178]">Admin / Marketplace</p><h1 className="mt-2 text-3xl font-black text-[#262424]">Marketplace Analytics</h1><p className="mt-2 text-sm text-[#6f655c]">Real listing activity and simple discovery signals.</p></div>
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">{metric.map(([label, value]) => <div key={label} className="rounded-[20px] border border-[#e6dfd5] bg-white p-4"><p className="text-xs text-[#6f655c]">{label}</p><p className="mt-2 text-2xl font-black text-[#262424]">{value.toLocaleString()}</p></div>)}</section>
    <div className="grid gap-4 lg:grid-cols-2">
      <RankedListings title="Most viewed listings" listings={sorted(l => l.views)} value={l => `${l.views} views`} />
      <RankedListings title="Most saved listings" listings={sorted(l => l.saves ?? 0)} value={l => `${l.saves ?? 0} saves`} />
      <RankedListings title="Most contacted listings" listings={sorted(contacts)} value={l => `${contacts(l)} contacts`} />
      <RankedListings title="Trending listings" listings={activeListings.filter(l => (l.trendingScore ?? 0) >= 10).sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))} value={l => `${l.trendingScore ?? 0} score`} />
      <RankedListings title="Listings with zero views" listings={listings.filter(l => l.views === 0)} value={() => "0 views"} />
      <RankedPlaces title="Most active categories" values={activeListings.map(l => l.category)} />
      <RankedPlaces title="Most active districts" values={activeListings.map(l => l.district)} />
    </div>
  </div>;
}
