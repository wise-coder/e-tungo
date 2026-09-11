"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import WantedCard from "@/components/WantedCard";
import EmptyState from "@/components/EmptyState";

export default function WantedPage() {
  const { t, wantedRequests } = useApp();
  const openRequests = wantedRequests.filter((r) => r.status === "open");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.wantedRequests}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {openRequests.length} open request{openRequests.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/wanted/new"
          className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} />
          {t.postRequest}
        </Link>
      </div>

      {openRequests.length === 0 ? (
        <EmptyState
          emoji="📋"
          title={t.noRequests}
          description={t.noRequestsDesc}
          actionLabel={t.postRequest}
          actionHref="/wanted/new"
        />
      ) : (
        <div className="space-y-3">
          {openRequests.map((req) => (
            <WantedCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
