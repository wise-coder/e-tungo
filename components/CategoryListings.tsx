"use client";

import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { useApp } from "@/context/AppContext";
import type { ListingCategory } from "@/lib/types";

export default function CategoryListings({
  category,
  categoryName,
}: {
  category: ListingCategory;
  categoryName: string;
}) {
  const { listings } = useApp();
  const activeListings = listings.filter(
    (listing) => listing.category === category && listing.status === "active"
  );

  return (
    <div className="min-h-screen bg-[#f3f1ed] px-4 py-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[#6f655c]">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/browse" className="hover:text-brand-700">Browse</Link>
          <span aria-hidden="true"> / </span>
          <span>{categoryName}</span>
        </nav>

        <header className="rounded-[28px] border border-[#e6dfd5] bg-white p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f655c]">
            Rwanda livestock marketplace
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#262424] md:text-4xl">
            {categoryName} for sale in Rwanda
          </h1>
          <p className="mt-3 text-sm text-[#6f655c]">
            {activeListings.length} active {activeListings.length === 1 ? "listing" : "listings"}
          </p>
        </header>

        {activeListings.length > 0 ? (
          <section aria-label={`${categoryName} listings`} className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {activeListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-dashed border-[#d8d0c6] bg-white p-8 text-center">
            <p className="text-sm text-[#6f655c]">No active {categoryName.toLowerCase()} listings right now.</p>
            <Link href="/browse" className="mt-4 inline-block font-semibold text-brand-700 hover:underline">
              Browse all livestock and products
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
