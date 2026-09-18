"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown, CircleX, MapPin, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";
import { ListingCardSkeleton } from "@/components/LoadingSkeleton";
import { ListingCategory } from "@/lib/types";
import { getCategoryLabel } from "@/lib/utils";
import { sortListingsForMarket } from "@/lib/listing-boost";

interface CategoryCardData {
  key: ListingCategory;
  titleEn: string;
  titleRw: string;
  descEn: string;
  descRw: string;
  image: string;
}

const CATEGORY_CARDS: CategoryCardData[] = [
  {
    key: "cattle",
    titleEn: "Cattle",
    titleRw: "Inka",
    descEn: "Healthy and productive cattle for your farm.",
    descRw: "Inka nzima kandi zitanga umusaruro ku bworozi bwawe.",
    image: "/cow.jpg",
  },
  {
    key: "goats",
    titleEn: "Goats",
    titleRw: "Ihene",
    descEn: "Quality goats for breeding and farming.",
    descRw: "Ihene nziza zo kororoka no korora.",
    image: "/goat.jpg",
  },
  {
    key: "sheep",
    titleEn: "Sheep",
    titleRw: "Intama",
    descEn: "Strong and healthy sheep for your livelihood.",
    descRw: "Intama zikomeye kandi nzima.",
    image: "/sheep.jpg",
  },
  {
    key: "chickens",
    titleEn: "Chicken",
    titleRw: "Inkoko",
    descEn: "Fresh and healthy chickens for your farm.",
    descRw: "Inkoko nzima ku bworozi bwawe.",
    image: "/chicken.jpg",
  },
  {
    key: "rabbits",
    titleEn: "Rabbits",
    titleRw: "Inkwavu",
    descEn: "Fast growing and high-quality rabbits.",
    descRw: "Inkwavu zikura vuba z'ubwoko bwiza.",
    image: "/rabbit.jpg",
  },
  {
    key: "fish",
    titleEn: "Fish",
    titleRw: "Amafi",
    descEn: "Healthy fish for a sustainable future.",
    descRw: "Amafi meza kandi ahesha umusaruro.",
    image: "/fish.jpg",
  },
  {
    key: "honey",
    titleEn: "Honey",
    titleRw: "Ubuki",
    descEn: "Pure and natural honey from local farms.",
    descRw: "Ubuki bw'umwimerere buturutse mu gihugu.",
    image: "/honey.jpg",
  },
  {
    key: "pigs",
    titleEn: "Pigs",
    titleRw: "Ingurube",
    descEn: "Strong and healthy pigs for better yields.",
    descRw: "Ingurube zikomeye zitanga inyungu.",
    image: "/pigs.jpg",
  },
  {
    key: "eggs",
    titleEn: "Eggs",
    titleRw: "Amagi",
    descEn: "Fresh eggs from trusted farmers.",
    descRw: "Amagi mashya aturutse ku borozi bizewe.",
    image: "/eggs.jpg",
  },
];

function BrowseContent() {
  const { lang, listings } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | "">(
    (searchParams.get("category") as ListingCategory) ?? ""
  );
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recommended");

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSelectedCategory((searchParams.get("category") as ListingCategory) ?? "");
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filteredListings = listings.filter((listing) => {
    if (listing.status !== "active" || (selectedCategory && listing.category !== selectedCategory))
      return false;
    const needle = query.trim().toLocaleLowerCase();
    return (
      !needle ||
      [listing.title, listing.description, listing.breed, listing.district, listing.category]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle)
    );
  });

  const sortedListings =
    sort === "recommended"
      ? sortListingsForMarket(filteredListings)
      : [...filteredListings].sort((a, b) =>
          sort === "price-low"
            ? a.price - b.price
            : sort === "price-high"
            ? b.price - a.price
            : sort === "views"
            ? b.views - a.views
            : new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        );

  const activeCategoryLabel = selectedCategory
    ? getCategoryLabel(selectedCategory, lang)
    : lang === "rw"
    ? "Amatungo yose"
    : "All categories";

  const setCategory = (category: ListingCategory | "") => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#fdfdfb] px-4 py-6 md:py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* 1. TOP HERO & SEARCH BAR matching newer-image.png */}
        <div className="mb-8 md:mb-10">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.24em] text-[#71675e]">
            {lang === "rw"
              ? "ISOKO RY'AMATUNGO MU RWANDA RYIZEWE"
              : "RWANDA'S TRUSTED LIVESTOCK MARKETPLACE"}
          </p>
          <h1 className="mt-2.5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#222120] leading-[1.12]">
            {lang === "rw" ? (
              <>
                Bona amatungo akwiriye,
                <br />
                ku bw&apos;ejo hazaza{" "}
                <span className="text-[#104b27]">heza kurushaho.</span>
              </>
            ) : (
              <>
                Find the right animals,
                <br />
                for a <span className="text-[#104b27]">better tomorrow.</span>
              </>
            )}
          </h1>
          <p className="mt-3.5 max-w-2xl text-sm sm:text-base text-[#675d54] leading-relaxed">
            {lang === "rw"
              ? "Gura kandi ugurishe amatungo, ibikomoka ku matungo n'ibindi — mu mutekano, byihuse kandi biturutse ku borozi n'abacuruzi bizewe mu Rwanda."
              : "Buy and sell livestock, farm products and more — safely, quickly and directly from trusted farmers and sellers across Rwanda."}
          </p>

          {/* Pill Search Bar matching newer-image.png */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-full bg-white p-2 border border-[#ebe5dc] shadow-[0_8px_24px_rgba(20,40,25,0.06)] gap-2 max-w-3xl">
            <div className="flex flex-1 items-center gap-3 px-3 py-2 sm:py-1">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === "rw"
                    ? "Shakisha itungo, igicuruzwa cyangwa icyiciro..."
                    : "Search for an animal, product or category..."
                }
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                aria-label="Search"
              />
            </div>

            <div className="hidden sm:flex items-center gap-1.5 border-l border-gray-200 px-4 text-xs font-semibold text-gray-600">
              <MapPin size={15} className="text-[#104b27]" />
              <span>Rwanda</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>

            <button
              type="button"
              className="rounded-xl sm:rounded-full bg-[rgb(0,167,52)] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#008f2c] shrink-0 text-center"
            >
              {lang === "rw" ? "Shakisha" : "Search"}
            </button>
          </div>
        </div>

        {/* 2. ANIMAL CARDS GRID from newer-image.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {CATEGORY_CARDS.map((card) => {
            const isActive = selectedCategory === card.key;
            const title = lang === "rw" ? card.titleRw : card.titleEn;
            const desc = lang === "rw" ? card.descRw : card.descEn;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setCategory(isActive ? "" : card.key)}
                className={`group relative h-56 sm:h-60 rounded-3xl overflow-hidden text-left focus:outline-none ${
                  isActive
                    ? "ring-4 ring-[#104b27] ring-offset-2 scale-[1.02]"
                    : "border border-black/5"
                }`}
              >
                {/* Full-bleed Photo with smooth cinematic zoom */}
                <Image
                  src={card.image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                {/* Selected Status Badge */}
                {isActive && (
                  <span className="absolute top-3.5 right-3.5 rounded-full bg-[#104b27] text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1">
                    <Check size={12} strokeWidth={3} />
                    {lang === "rw" ? "Byahiswemo" : "Selected"}
                  </span>
                )}

                {/* Bottom Content Bar */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-[13px] text-white/85 font-medium leading-snug line-clamp-2">
                      {desc}
                    </p>
                  </div>

                  {/* Circular Action Arrow Button */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                      isActive
                        ? "bg-[rgb(0,167,52)] text-white ring-2 ring-white scale-105"
                        : "bg-white text-[rgb(0,167,52)] group-hover:bg-[rgb(0,167,52)] group-hover:text-white group-hover:ring-2 group-hover:ring-white/80"
                    }`}
                  >
                    <ArrowRight
                      size={16}
                      strokeWidth={2.5}
                      className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. LISTINGS SECTION */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900 md:text-2xl">
                {lang === "rw" ? "Amatangazo aboneka" : "Available listings"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 md:text-sm">
                {sortedListings.length}{" "}
                {lang === "rw"
                  ? "itangazo"
                  : sortedListings.length === 1
                  ? "listing"
                  : "listings"}
              </p>
              {(selectedCategory || query) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#104b27] hover:underline"
                >
                  <CircleX size={14} />
                  {lang === "rw"
                    ? "Siba ibyashunguwe"
                    : `Clear filters (${activeCategoryLabel})`}
                </button>
              )}
            </div>

            <label className="text-xs text-gray-600 flex items-center self-start sm:self-auto">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="ml-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="newest">Newest</option>
                <option value="price-low">Lowest price</option>
                <option value="price-high">Highest price</option>
                <option value="views">Most viewed</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sortedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
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
