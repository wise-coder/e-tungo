import Link from "next/link";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, PhoneCall, BadgeCheck } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { getListingsBySellerId, getUserById } from "@/lib/db";
import { createPageMetadata, NO_INDEX_ROBOTS } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loadFarm = cache(async (id: string) =>
  Promise.all([getUserById(id), getListingsBySellerId(id)])
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const [profile, listings] = await loadFarm(id);
    const fallbackListing = listings[0];
    if (!profile && !fallbackListing) return { title: "Farm not found", robots: NO_INDEX_ROBOTS };

    const name = profile?.name ?? fallbackListing?.sellerName ?? "Farm";
    const district = profile?.district ?? fallbackListing?.sellerDistrict ?? fallbackListing?.district ?? "Rwanda";
    return createPageMetadata({
      title: `${name} Livestock Listings in ${district}`,
      description: `Browse active livestock and animal-product listings from ${name} in ${district}, Rwanda on e-tungo.`,
      path: `/farm/${encodeURIComponent(id)}`,
    });
  } catch {
    return { title: "Farm profile", robots: NO_INDEX_ROBOTS };
  }
}

export default async function FarmProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, listings] = await loadFarm(id);

  const fallbackListing = listings[0];

  if (!profile && !fallbackListing) {
    notFound();
  }

  const name = profile?.name ?? fallbackListing?.sellerName ?? "Farm";
  const district = profile?.district ?? fallbackListing?.sellerDistrict ?? fallbackListing?.district ?? "";
  const bio =
    profile?.bio ||
    "A trusted farm selling verified livestock and farm products through e-tungo.";
  const phone = profile?.phone ?? fallbackListing?.sellerPhone ?? "";
  const activeListings = listings.filter((listing) => listing.status === "active");
  const soldListings = listings.filter((listing) => listing.status === "sold").length;
  const contactVerified = profile?.phoneVerified || fallbackListing?.sellerPhoneVerified;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-700">
          <ArrowLeft size={18} />
          Back
        </Link>
        <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
          Farm profile
        </span>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
        <div className="bg-gradient-to-br from-[#eff5ef] to-[#faf8f4] px-5 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-700 text-3xl font-bold text-white shadow-sm">
                {profile?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profileImage}
                    alt={`${name} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f705f]">
                  Farm
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-[#262424] md:text-3xl">
                  {name}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-[#5f564e]">
                  <MapPin size={14} />
                  {district || "Rwanda"}
                </p>
              </div>
            </div>

              {phone && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                <PhoneCall size={16} />
                Call farm
              </a>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Listings</p>
              <p className="mt-1 text-2xl font-black text-gray-900">{listings.length}</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Active</p>
              <p className="mt-1 text-2xl font-black text-gray-900">{activeListings.length}</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Sold</p>
              <p className="mt-1 text-2xl font-black text-gray-900">{soldListings}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 md:px-8">
          <div className="max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
              About this farm
            </h2>
            <p className="mt-3 text-sm leading-7 text-gray-700 md:text-base">{bio}</p>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black tracking-tight text-[#262424]">
                  Current listings
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Browse the active products from this farm.
                </p>
              </div>
              {contactVerified && (
                <p className="hidden items-center gap-1.5 text-sm font-medium text-gray-500 md:inline-flex">
                  <BadgeCheck size={14} className="text-brand-700" />
                  Verified contact available
                </p>
              )}
            </div>

            {activeListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No active listings right now.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {activeListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
