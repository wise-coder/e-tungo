"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Clock, Share2, Flag, ShieldCheck, Eye } from "lucide-react";
import { useApp } from "@/context/AppContext";
import PhoneContactButtons from "@/components/PhoneContactButtons";
import CategoryIcon from "@/components/CategoryIcon";
import { formatPrice, formatTimeAgo, getCategoryLabel } from "@/lib/utils";
import type { User } from "@/lib/types";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, listings } = useApp();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [shareMsg, setShareMsg] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<User | null>(null);

  const listing = listings.find((l) => l.id === id);

  useEffect(() => {
    if (!listing) return;

    let cancelled = false;
    fetch(`/api/users/${listing.sellerId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setSellerProfile(data as User);
        }
      })
      .catch(() => {
        if (!cancelled) setSellerProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [listing]);

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🐄</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Listing not found</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-brand-700 font-semibold hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} — ${formatPrice(listing.price)} in ${listing.district}`,
          url: window.location.href,
        });
      } catch {/* cancelled */}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    }
  };

  const detailFields: { label: string; value: string | undefined }[] = [
    { label: t.breed, value: listing.breed },
    { label: t.sex, value: listing.sex ? (listing.sex === "male" ? t.male : t.female) : undefined },
    { label: t.age, value: listing.age },
    { label: t.weight, value: listing.weight },
    { label: t.milkProduction, value: listing.milkProduction },
    { label: t.vaccination, value: listing.vaccinationStatus },
    { label: t.purpose, value: listing.purpose },
    { label: "Type", value: listing.chickenType },
    { label: t.litresAvailable, value: listing.litresAvailable ? `${listing.litresAvailable} L` : undefined },
    { label: t.traysAvailable, value: listing.traysAvailable ? `${listing.traysAvailable} trays` : undefined },
  ].filter((f) => f.value !== undefined);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="sticky top-0 md:top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-brand-700 font-medium text-sm"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-gray-600 hover:text-brand-700 font-medium text-sm"
          aria-label={t.share}
        >
          <Share2 size={18} />
          {shareMsg ? "Copied!" : t.share}
        </button>
      </div>

      {/* Images */}
      <div className="relative bg-gray-100">
        <div className="relative h-72 md:h-96">
          {listing.images[activeImage] ? (
            <Image
              src={listing.images[activeImage]}
              alt={`${listing.title} photo ${activeImage + 1}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 672px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">
              <CategoryIcon category={listing.category} size={72} />
            </div>
          )}
          {listing.status === "sold" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white text-lg font-bold px-6 py-2 rounded-full">
                {t.soldBadge}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {listing.images.length > 1 && (
          <div className="flex gap-2 px-4 py-2 bg-white overflow-x-auto">
            {listing.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                  i === activeImage ? "border-brand-600" : "border-transparent"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-5">
        {/* Basic info */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {listing.title}
            </h1>
            <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 mt-1">
              <Eye size={13} />
              {listing.views}
            </span>
          </div>
          <p className="text-2xl font-bold text-brand-700 mt-1">
            {formatPrice(listing.price)}
            {listing.priceUnit && (
              <span className="text-gray-500 font-normal text-sm ml-2">
                {listing.priceUnit}
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {listing.district}{listing.sector ? `, ${listing.sector}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatTimeAgo(listing.postedAt, lang)}
            </span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
              <CategoryIcon category={listing.category} size={12} />
              {getCategoryLabel(listing.category, lang)}
            </span>
          </div>
        </div>

        {/* Details table */}
        {detailFields.length > 0 && (
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {detailFields.map((field, i) => (
                  <tr key={field.label} className={i < detailFields.length - 1 ? "border-b border-gray-200" : ""}>
                    <td className="px-4 py-3 text-gray-500 font-medium w-1/2">
                      {field.label}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-semibold">
                      {field.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {t.description}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{listing.description}</p>
          </div>
        )}

        {/* Seller card */}
        <Link
          href={`/farm/${listing.sellerId}`}
          className="block rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-brand-700 hover:bg-white"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t.seller}
            </h3>
            <span className="text-xs font-semibold text-brand-700">View farm profile</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-700 text-lg font-bold text-white">
              {sellerProfile?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sellerProfile.profileImage}
                  alt={`${listing.sellerName} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                listing.sellerName.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{sellerProfile?.name ?? listing.sellerName}</p>
              <p className="text-sm text-gray-500">{sellerProfile?.district ?? listing.sellerDistrict}</p>
              <p className="line-clamp-2 text-xs leading-5 text-gray-500">
                {sellerProfile?.bio || "Simple farm profile and more listings from this seller."}
              </p>
              {listing.sellerPhoneVerified && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <ShieldCheck size={12} />
                  {t.phoneVerified}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Contact buttons */}
        {listing.status !== "sold" && (
          <PhoneContactButtons
            phone={listing.sellerPhone}
            sellerName={listing.sellerName}
            listingTitle={listing.title}
          />
        )}

        {/* Report */}
        <div className="text-center pt-2 pb-4">
          <button className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
            <Flag size={12} />
            {t.reportListing}
          </button>
        </div>
      </div>
    </div>
  );
}
