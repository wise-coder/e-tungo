"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Listing } from "@/lib/types";
import ListingCard from "@/components/ListingCard";

export default function SavedListingsPage() {
  const { user, hydrated } = useApp();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!hydrated || !user) return;
    void fetch("/api/saved", { cache: "no-store" }).then(response => response.ok ? response.json() : [])
      .then(data => setListings(data)).catch(() => setListings([])).finally(() => setLoading(false));
  }, [hydrated, user]);
  if (hydrated && !user) return <div className="mx-auto max-w-lg px-4 py-12 text-center"><p>Sign in to see saved listings.</p><Link className="mt-4 inline-block rounded-full bg-brand-700 px-5 py-3 text-white" href="/signin?redirect=/account/saved">Sign in</Link></div>;
  return <div className="mx-auto max-w-5xl px-4 py-6">
    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Heart size={22} /> Saved Listings</h1>
    {loading ? <p className="mt-6 text-sm text-gray-500">Loading saved listings...</p>
      : listings.length ? <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}</div>
      : <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-600">No saved listings yet. <Link className="font-semibold text-brand-700" href="/browse">Browse listings</Link></div>}
  </div>;
}
