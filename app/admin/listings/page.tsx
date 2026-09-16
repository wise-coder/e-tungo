import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Eye, ImageIcon, MapPin, Package } from "lucide-react";
import { formatPrice, formatTimeAgo } from "@/lib/utils";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";
import AdminDeleteButton from "@/components/AdminDeleteButton";
import AdminListingControls from "@/components/AdminListingControls";
import { listingImageAlt } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const { listings, activeListings, soldListings } = await loadAdminDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a8178]">
              Admin / Listings
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#262424]">Listings</h1>
            <p className="mt-2 text-sm leading-6 text-[#6f655c]">
              Review engagement, status, and visibility for each product.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="rounded-full border border-[#e6dfd5] bg-[#faf8f4] px-3 py-2 text-[#375d3f]">
              <strong>{activeListings.length}</strong> active
            </span>
            <span className="rounded-full border border-[#e6dfd5] bg-[#faf8f4] px-3 py-2 text-[#375d3f]">
              <strong>{soldListings.length}</strong> sold
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {listings.map((listing) => (
          <article
            key={listing.id}
            className="rounded-[26px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#faf8f4] text-[#375d3f]">
                {listing.images[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={listingImageAlt(listing)}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon size={22} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-black tracking-tight text-[#262424]">
                    {listing.title}
                  </h2>
                  <span className="rounded-full border border-[#e6dfd5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8178]">
                    {listing.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#6f655c]">{listing.sellerName}</p>
                <div className="mt-3 grid gap-2 text-sm text-[#6f655c] sm:grid-cols-2">
                  <div className="inline-flex items-center gap-2">
                    <Package size={15} className="text-[#375d3f]" />
                    {listing.category}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MapPin size={15} className="text-[#375d3f]" />
                    {listing.district}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Eye size={15} className="text-[#375d3f]" />
                    {listing.views} views · {listing.uniqueViews ?? 0} unique
                  </div>
                  <div>♡ {listing.saves ?? 0} saves</div>
                  <div>📞 {listing.calls ?? 0} calls · 💬 {listing.whatsappClicks ?? 0} WhatsApp</div>
                  <div>{listing.shares ?? 0} shares</div>
                  <div className="font-semibold text-[#262424]">
                    {formatPrice(listing.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ebe4] pt-4">
              <p className="text-xs text-[#8a8178]">
                Posted {formatTimeAgo(listing.postedAt, "en")}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={`/listing/${listing.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#375d3f]"
                >
                  Open listing
                  <ArrowUpRight size={16} />
                </Link>
                <AdminDeleteButton
                  endpoint={`/api/admin/listings/${listing.id}`}
                  confirmMessage={`Delete listing "${listing.title}"?`}
                />
              </div>
            </div>
            <AdminListingControls listing={listing} />
          </article>
        ))}
      </section>
    </div>
  );
}
