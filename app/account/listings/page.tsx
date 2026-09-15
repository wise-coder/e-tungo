"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Edit, Trash2, CheckCircle, Plus } from "lucide-react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import CategoryIcon from "@/components/CategoryIcon";
import type { Listing } from "@/lib/types";
import { formatPrice, formatTimeAgo } from "@/lib/utils";

export default function MyListingsPage() {
  const { t, lang, hydrated, user, deleteListing, updateListing } = useApp();
  const router = useRouter();

  const [confirmSoldId, setConfirmSoldId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [ownedListings, setOwnedListings] = useState<Listing[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      setOwnedListings(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams({
      sellerId: user.id,
    });

    fetch(`/api/listings?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) return [] as Listing[];
        return (await response.json()) as Listing[];
      })
      .then((data) => {
        if (!cancelled) setOwnedListings(data);
      })
      .catch((error) => {
        console.error("Failed to load seller listings", error);
        if (!cancelled) setOwnedListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, user]);

  if (!hydrated) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-5 w-40 mx-auto mb-2 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-56 mx-auto rounded bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h2>
        <Link
          href="/signin?redirect=/account/listings"
          className="block mt-4 py-4 bg-brand-700 text-white font-bold rounded-xl text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const myListings = ownedListings ?? [];

  return (
    <div className="max-w-lg mx-auto">
      <div className="sticky top-0 md:top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-brand-700">
            <ArrowLeft size={22} />
          </button>
          <h2 className="font-bold text-gray-900">{t.myListings}</h2>
        </div>
        <Link
          href="/sell"
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <Plus size={16} />
          {t.sell}
        </Link>
      </div>

      <div className="px-4 py-4">
        {loading && ownedListings === null ? (
          <div className="space-y-3">
            <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        ) : myListings.length === 0 ? (
          <EmptyState
            emoji="📋"
            title={t.noListings}
            description={t.noListingsDesc}
            actionLabel={t.sellSomething}
            actionHref="/sell"
          />
        ) : (
          <div className="space-y-3">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        <CategoryIcon category={listing.category} size={22} />
                      </div>
                    )}
                    {listing.status === "sold" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-red-500 px-1.5 py-0.5 rounded">
                          {t.soldBadge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {listing.title}
                    </p>
                    <p className="text-brand-700 font-bold text-sm mt-0.5">
                      {formatPrice(listing.price)}
                    </p>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                      <p><Eye size={11} className="mr-1 inline" />{listing.views} views · {listing.uniqueViews ?? 0} unique · ♡ {listing.saves ?? 0} saves</p>
                      <p>📞 {listing.calls ?? 0} calls · 💬 {listing.whatsappClicks ?? 0} WhatsApp clicks · {listing.shares ?? 0} shares</p>
                      <p>{formatTimeAgo(listing.postedAt, lang)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 flex">
                  {listing.status === "active" && (
                    <button
                      onClick={() => setConfirmSoldId(listing.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors border-r border-gray-100"
                    >
                      <CheckCircle size={14} />
                      {t.markSold}
                    </button>
                  )}
                  <Link
                    href={`/listing/${listing.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100"
                  >
                    <Edit size={14} />
                    {t.edit}
                  </Link>
                  <button
                    onClick={() => setConfirmDeleteId(listing.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmSoldId}
        title={t.confirmMarkSold}
        onCancel={() => setConfirmSoldId(null)}
        onConfirm={async () => {
          if (confirmSoldId && await updateListing(confirmSoldId, { status: "sold" })) {
            setOwnedListings(prev => prev?.map(listing => listing.id === confirmSoldId ? { ...listing, status: "sold" } : listing) ?? prev);
          }
          setConfirmSoldId(null);
        }}
        confirmLabel={t.confirmSold}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Are you sure you want to delete this listing?"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (confirmDeleteId && await deleteListing(confirmDeleteId)) {
            setOwnedListings((prev) =>
              prev?.filter((listing) => listing.id !== confirmDeleteId) ?? prev
            );
          }
          setConfirmDeleteId(null);
        }}
        confirmLabel={t.delete}
        danger
      />
    </div>
  );
}
