"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { Listing } from "@/lib/types";
import { formatPrice, formatTimeAgo, getCategoryLabel } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import CategoryIcon from "./CategoryIcon";
import { listingBadges } from "@/lib/marketplace-badges";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
}

export default function ListingCard({ listing, compact = false }: ListingCardProps) {
  const { lang, t } = useApp();
  const badges = listingBadges(listing);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-lg"
    >
      {/* Image */}
      <div className={`relative bg-gray-100 ${compact ? "h-36" : "h-44"} overflow-hidden`}>
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 300px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
              <CategoryIcon category={listing.category} size={28} />
            </div>
          </div>
        )}
        {listing.status === "sold" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {t.soldBadge}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
            <CategoryIcon category={listing.category} size={12} className="text-brand-700" />
            {getCategoryLabel(listing.category, lang)}
          </span>
        </div>
        {badges.length > 0 && <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {badges.map(badge => <span key={badge} className="rounded-full bg-[#375d3f]/95 px-2.5 py-1 text-[10px] font-semibold text-white">{badge}</span>)}
        </div>}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="line-clamp-1 text-sm font-semibold leading-snug text-gray-950">
          {listing.title}
        </p>
        <p className="mt-1 text-sm font-bold text-brand-700">
          {formatPrice(listing.price)}
          {listing.priceUnit && (
            <span className="ml-1 text-xs font-normal text-gray-500">
              {listing.priceUnit}
            </span>
          )}
        </p>
        <p className="mt-2 text-xs text-gray-500">👁 {listing.views} views · ♡ {listing.saves ?? 0} saves</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} />
            {listing.district}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {formatTimeAgo(listing.postedAt, lang)}
          </span>
        </div>
      </div>
    </Link>
  );
}
