"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/types";
import { isBoostActive, isFeaturedActive } from "@/lib/listing-boost";

export default function AdminListingControls({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [durationHours, setDurationHours] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function act(action: string) {
    if (["sold", "hide"].includes(action) && !window.confirm(`${action === "sold" ? "Mark sold" : "Hide"} ${listing.title}?`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/listings/${encodeURIComponent(listing.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, durationHours }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Action failed.");
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Action failed."); }
    finally { setBusy(false); }
  }
  const button = (label: string, action: string) => <button type="button" disabled={busy} onClick={() => void act(action)} className="rounded-full border border-[#e6dfd5] bg-[#faf8f4] px-3 py-2 text-xs font-semibold text-[#375d3f] disabled:opacity-50">{label}</button>;
  return <div className="mt-4 border-t border-[#f0ebe4] pt-4">
    <p className="mb-2 text-xs text-[#6f655c]">{isFeaturedActive(listing) ? `Featured ${listing.featureExpiresAt ? `until ${new Date(listing.featureExpiresAt).toLocaleDateString()}` : "active"}` : "Not featured"} · {isBoostActive(listing) ? `Boosted ${listing.boostExpiresAt ? `until ${new Date(listing.boostExpiresAt).toLocaleDateString()}` : "active"}` : "Not boosted"} {listing.recommended ? "· Recommended" : ""}</p>
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Promotion duration" value={durationHours} onChange={event => setDurationHours(Number(event.target.value))} className="rounded-full border border-[#e6dfd5] bg-white px-3 py-2 text-xs">
        <option value={24}>24 hours</option><option value={72}>3 days</option><option value={168}>7 days</option><option value={336}>14 days</option>
      </select>
      {button("Feature", "feature")}{button("Boost", "boost")}{button("Recommend", "recommend")}{button("Remove promotion", "remove-promotion")}
      {listing.status !== "sold" && button("Mark sold", "sold")}
      {listing.status === "hidden" ? button("Show", "show") : button("Hide", "hide")}
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
  </div>;
}
