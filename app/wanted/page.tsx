"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import WantedCard from "@/components/WantedCard";
import EmptyState from "@/components/EmptyState";

export default function WantedPage() {
  const { t, lang, wantedRequests } = useApp();
  const openRequests = wantedRequests.filter((r) => r.status === "open");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {t.wantedRequests}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === "rw"
              ? `${openRequests.length} ${openRequests.length === 1 ? "icyifuzo gifunguye" : "ibifuzo bifunguye"}`
              : `${openRequests.length} open request${openRequests.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/wanted/new"
          className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shrink-0 self-start sm:self-auto shadow-sm"
        >
          <Plus size={16} />
          <span>{t.postRequest}</span>
        </Link>
      </div>

      {openRequests.length === 0 ? (
        <EmptyState
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
