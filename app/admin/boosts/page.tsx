import { BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { formatPrice, formatTimeAgo } from "@/lib/utils";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";
import { isListingBoostActive } from "@/lib/listing-boost";
import AdminBoostButton from "@/components/AdminBoostButton";

export const dynamic = "force-dynamic";

function formatExpiry(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export default async function AdminBoostsPage() {
  const { activeListings } = await loadAdminDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a8178]">
              Admin / Boost review
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#262424]">Boost review</h1>
            <p className="mt-2 text-sm leading-6 text-[#6f655c]">
              Confirm a boost here and the listing is moved to the top of buyer-facing feeds across the site.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e6dfd5] bg-[#faf8f4] px-4 py-3 text-sm text-[#6f655c]">
            <strong className="text-[#262424]">{activeListings.length}</strong> active listings ready
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {activeListings.map((listing) => {
          const boosted = isListingBoostActive(listing);

          return (
            <article
              key={listing.id}
              className="rounded-[26px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff5ef] text-[#375d3f]">
                    <Sparkles size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black tracking-tight text-[#262424]">
                      {listing.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#6f655c]">{listing.sellerName}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-[#e6dfd5] bg-[#faf8f4] px-3 py-1 font-semibold text-[#375d3f]">
                        {listing.category}
                      </span>
                      <span className="rounded-full border border-[#e6dfd5] bg-[#faf8f4] px-3 py-1 font-semibold text-[#375d3f]">
                        {formatPrice(listing.price)}
                      </span>
                      <span className="rounded-full border border-[#e6dfd5] bg-[#faf8f4] px-3 py-1 font-semibold text-[#375d3f]">
                        {listing.district}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[#8a8178]">
                      Posted {formatTimeAgo(listing.postedAt, "en")}
                      {boosted && listing.boostExpiresAt
                        ? ` · boosted until ${formatExpiry(listing.boostExpiresAt)}`
                        : ""}
                    </p>
                  </div>
                </div>

                {boosted ? (
                  <span className="rounded-full bg-[#eff5ef] px-3 py-1 text-xs font-semibold text-[#375d3f]">
                    Boosted
                  </span>
                ) : (
                  <AdminBoostButton
                    endpoint={`/api/admin/listings/${listing.id}/boost`}
                    confirmMessage={`Boost "${listing.title}" for buyer feeds?`}
                  />
                )}
              </div>

              {boosted ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#d6e4d7] bg-[#f8fbf8] px-4 py-4 text-sm text-[#4b453f]">
                  This listing is already boosted and will appear ahead of regular listings in browse results.
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-[#d6e4d7] bg-[#f8fbf8] px-4 py-4 text-sm text-[#4b453f]">
                  Confirming boost moves this listing to the top of the market feeds so more people see it first.
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="rounded-[28px] border border-dashed border-[#e6dfd5] bg-[#faf8f4] p-5 text-sm leading-6 text-[#6f655c]">
        <div className="flex items-center gap-2 font-semibold text-[#262424]">
          <ShieldCheck size={16} className="text-[#375d3f]" />
          Boost algorithm
        </div>
        <p className="mt-2">
          Boosted listings are stored in the database with a boost time and expiry, then sorted ahead of normal listings
          everywhere buyers browse.
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-[#375d3f]">
          <BadgeCheck size={16} />
          Simple, visible, and easy to manage.
        </p>
      </section>
    </div>
  );
}
