"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, XCircle, PhoneCall, Lock } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import ConfirmModal from "@/components/ConfirmModal";
import EmptyState from "@/components/EmptyState";
import CategoryIcon from "@/components/CategoryIcon";
import { getCategoryLabel, formatTimeAgo } from "@/lib/utils";

export default function MyRequestsPage() {
  const { t, lang, user, wantedRequests, deleteWantedRequest, updateWantedRequest } = useApp();
  const router = useRouter();

  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Sign in required</h2>
        <Link
          href="/signin?redirect=/account/requests"
          className="mt-4 block rounded-xl bg-brand-700 py-4 text-center font-bold text-white"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const myRequests = wantedRequests.filter((r) => r.buyerId === user.id);

  return (
    <div className="mx-auto max-w-lg">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:top-16">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-brand-700">
            <ArrowLeft size={22} />
          </button>
          <h2 className="font-bold text-gray-900">{t.myRequests}</h2>
        </div>
        <Link
          href="/wanted/new"
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <Plus size={16} />
          {t.postRequest}
        </Link>
      </div>

      <div className="px-4 py-4">
        {myRequests.length === 0 ? (
          <EmptyState
            title={t.noRequests}
            description="You haven't posted any buyer requests yet."
            actionLabel={t.postRequest}
            actionHref="/wanted/new"
          />
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div key={req.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      <CategoryIcon category={req.category} size={22} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{req.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {getCategoryLabel(req.category, lang)} • {req.buyerDistrict}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <PhoneCall size={12} />
                        <span>{req.buyerPhone}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {formatTimeAgo(req.postedAt, lang)}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                        req.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <div className="flex border-t border-gray-100">
                  {req.status === "open" && (
                    <button
                      onClick={() => setConfirmCloseId(req.id)}
                      className="flex-1 border-r border-gray-100 py-3 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <XCircle size={14} />
                        {t.closeRequest}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(req.id)}
                    className="flex-1 py-3 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Trash2 size={14} />
                      {t.delete}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmCloseId}
        title="Close this request?"
        onCancel={() => setConfirmCloseId(null)}
        onConfirm={() => {
          if (confirmCloseId) updateWantedRequest(confirmCloseId, { status: "closed" });
          setConfirmCloseId(null);
        }}
        confirmLabel={t.closeRequest}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete this request?"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteWantedRequest(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        confirmLabel={t.delete}
        danger
      />
    </div>
  );
}
