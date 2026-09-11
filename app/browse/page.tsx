"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CircleX } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";
import CategoryIcon from "@/components/CategoryIcon";
import { ListingCardSkeleton } from "@/components/LoadingSkeleton";
import { ListingCategory } from "@/lib/types";
import { getCategoryLabel } from "@/lib/utils";
import { sortListingsForMarket } from "@/lib/listing-boost";

const ANIMAL_CATEGORIES: ListingCategory[] = [
  "cattle",
  "goats",
  "sheep",
  "pigs",
  "chickens",
  "rabbits",
  "fish",
  "eggs",
  "honey",
];

function BrowseContent() {
  const { lang, listings } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | "">(
    (searchParams.get("category") as ListingCategory) ?? ""
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectedCategory((searchParams.get("category") as ListingCategory) ?? "");
  }, [searchParams]);

  const filteredListings = listings.filter((listing) => {
    if (listing.status !== "active") return false;
    if (selectedCategory && listing.category !== selectedCategory) return false;

    return true;
  });

  const sortedListings = sortListingsForMarket(filteredListings);

  const activeCategoryLabel = selectedCategory
    ? getCategoryLabel(selectedCategory, lang)
    : lang === "rw"
      ? "Amatungo yose"
      : "All animals";

  const setCategory = (category: ListingCategory | "") => {
    setSelectedCategory(category);

    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#f3f1ed]">
      <section className="border-b border-[#e3ddd4] px-4 pb-8 pt-8 md:pb-12 md:pt-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f655c] md:text-sm">
            {lang === "rw" ? "Amatungo ari ku isoko" : "Livestock marketplace"}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#262424] sm:text-4xl md:text-5xl">
            {lang === "rw"
              ? "Shakisha amatungo ari ku isoko"
              : "Browse livestock on the market"}
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[#6b6056] md:text-base md:leading-7">
            {lang === "rw"
              ? "Hitamo ubwoko bw'itungo ushaka kugira ngo ubone amatangazo y'ibyo biri ku isoko gusa."
              : "Choose an animal type to see only the listings available for that category."}
          </p>
        </div>
      </section>

      <section className="px-4 py-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-xl font-black tracking-tight text-[#262424] md:text-3xl">
              {lang === "rw" ? "Ni iki ushaka?" : "What do you want?"}
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#6f655c] md:text-sm md:leading-6">
              {lang === "rw"
                ? "Kanda ku gasanduku k'itungo kugirango ubone ibintu bihuye n'icyo ushaka."
                : "Tap an animal box to narrow the listings down instantly."}
            </p>
          </div>

          <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={`group rounded-[20px] border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                !selectedCategory
                  ? "border-[#375d3f] bg-[#eff5ef] shadow-[0_16px_30px_rgba(55,93,63,0.12)]"
                  : "border-[#e6dfd5] bg-white shadow-[0_12px_24px_rgba(37,32,27,0.05)]"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#efece7] text-xl">
                🌿
              </div>
              <div className="mt-3 text-base font-black text-[#262424] md:text-lg">
                {lang === "rw" ? "Byose" : "All"}
              </div>
              <div className="mt-1 text-xs text-[#6f655c] md:text-sm">
                {lang === "rw" ? "Reba byose" : "View everything"}
              </div>
            </button>

            {ANIMAL_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategory(isActive ? "" : category)}
                  className={`group rounded-[20px] border p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                    isActive
                      ? "border-[#375d3f] bg-[#eff5ef] shadow-[0_16px_30px_rgba(55,93,63,0.12)]"
                      : "border-[#e6dfd5] bg-white shadow-[0_12px_24px_rgba(37,32,27,0.05)]"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#efece7] text-xl">
                    <CategoryIcon category={category} size={18} />
                  </div>
                  <div className="mt-3 text-base font-black text-[#262424] md:text-lg">
                    {getCategoryLabel(category, lang)}
                  </div>
                  <div className="mt-1 text-xs text-[#6f655c] md:text-sm">
                    {lang === "rw" ? "Kanda hano" : "Tap to filter"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#4b453f] shadow-[0_8px_18px_rgba(37,32,27,0.06)] md:px-4 md:py-2 md:text-sm">
              <CheckCircle2 size={16} className="text-[#375d3f]" />
              <span>
                {lang === "rw" ? "Icyiciro cyatoranyijwe" : "Selected category"}:{" "}
                <strong>{activeCategoryLabel}</strong>
              </span>
            </div>

            {selectedCategory && (
              <button
                type="button"
                onClick={() => setCategory("")}
                className="inline-flex items-center gap-2 rounded-full border border-[#e6dfd5] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#262424] transition-colors hover:border-[#375d3f] hover:text-[#375d3f] md:px-4 md:py-2 md:text-sm"
              >
                <CircleX size={16} />
                {lang === "rw" ? "Siba icyiciro" : "Clear filter"}
              </button>
            )}
          </div>

          <div className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-black tracking-tight text-[#262424] md:text-2xl">
                  {lang === "rw" ? "Amatangazo aboneka" : "Available listings"}
                </h3>
                <p className="mt-1 text-xs text-[#6f655c] md:text-sm">
                  {sortedListings.length}{" "}
                  {lang === "rw"
                    ? sortedListings.length === 1
                      ? "itangazo"
                      : "itangazo"
                    : sortedListings.length === 1
                      ? "listing"
                      : "listings"}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ListingCardSkeleton key={index} />
                ))}
              </div>
            ) : sortedListings.length === 0 ? (
              <EmptyState
                title={lang === "rw" ? "Nta matangazo abonetse" : "No listings found"}
                description={
                  lang === "rw"
                    ? "Gerageza gukuraho zimwe mu zungurura kugira ngo ubone iboneka ku isoko."
                    : "Try clearing some filters to see more listings."
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {sortedListings.map((listing) => (
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

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-center text-gray-500">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
