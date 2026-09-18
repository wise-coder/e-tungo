"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Package, Calendar, DollarSign, PhoneCall, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import CategoryIcon from "@/components/CategoryIcon";
import { getCategoryLabel, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

export default function WantedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, wantedRequests } = useApp();
  const router = useRouter();

  const request = wantedRequests.find((r) => r.id === id);

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-4"><Search size={48} className="text-gray-400" /></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Request not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-brand-700 font-semibold hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 md:top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-brand-700">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-bold text-gray-900">{t.wantedRequests}</h2>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Category badge */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 flex items-center justify-center text-3xl text-white">
            <CategoryIcon category={request.category} size={28} tone="light" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white bg-brand-700 px-2.5 py-1 rounded-full">
              {getCategoryLabel(request.category, lang)}
            </span>
            <p className="text-xl font-bold text-gray-900 mt-1.5">{request.title}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          {request.quantity && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <Package size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600 w-28">Quantity</span>
              <span className="text-sm font-semibold text-gray-900">{request.quantity}</span>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 w-28">{t.location}</span>
            <span className="text-sm font-semibold text-gray-900">{request.buyerDistrict}</span>
          </div>
          {request.budget && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <DollarSign size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600 w-28">Budget</span>
              <span className="text-sm font-semibold text-brand-700">{request.budget}</span>
            </div>
          )}
          {request.neededBy && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600 w-28">{t.needed}</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(request.neededBy).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 px-4 py-3">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600 w-28">Posted</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatTimeAgo(request.postedAt, lang)}
            </span>
          </div>
        </div>

        {/* Description */}
        {request.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {t.description}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{request.description}</p>
          </div>
        )}

        {/* Buyer info */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Buyer</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg">
              {request.buyerName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{request.buyerName}</p>
              <p className="text-sm text-gray-500">{request.buyerDistrict}</p>
            </div>
          </div>
          <a
            href={`tel:${request.buyerPhone.replace(/[^\d+]/g, "")}`}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            <PhoneCall size={16} />
            {t.callBuyer}
          </a>
          <p className="mt-2 text-center text-xs text-gray-500">{request.buyerPhone}</p>
        </div>

        {/* CTA for sellers */}
        <div className="bg-brand-700 border border-brand-700 rounded-2xl p-4 text-center">
          <p className="text-sm text-white font-medium mb-3">
            Can you fulfill this request? List what you have!
          </p>
          <Link
            href="/sell"
            className="inline-block bg-brand-700 hover:bg-brand-800 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            + {t.sell}
          </Link>
        </div>
      </div>
    </div>
  );
}
