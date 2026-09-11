"use client";

import Link from "next/link";
import { MapPin, Clock, Package, PhoneCall } from "lucide-react";
import { WantedRequest } from "@/lib/types";
import { formatTimeAgo, getCategoryLabel } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import CategoryIcon from "./CategoryIcon";

interface WantedCardProps {
  request: WantedRequest;
}

export default function WantedCard({ request }: WantedCardProps) {
  const { lang, t } = useApp();

  return (
    <Link
      href={`/wanted/${request.id}`}
      className="block rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-brand-700 hover:shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white">
          <CategoryIcon category={request.category} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-gray-950">
            {request.title}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{request.buyerName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <PhoneCall size={12} />
            <span>{request.buyerPhone}</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {getCategoryLabel(request.category, lang)}
          </p>
          {request.quantity && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-600">
              <Package size={12} />
              <span>{request.quantity}</span>
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              {request.buyerDistrict}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {formatTimeAgo(request.postedAt, lang)}
            </span>
          </div>
          {request.budget && (
            <p className="mt-1.5 text-xs font-medium text-brand-700">
              Budget: {request.budget}
            </p>
          )}
        </div>
        <span className="mt-1 flex-shrink-0 text-xs font-medium text-brand-700">
          {t.viewRequest} →
        </span>
      </div>
    </Link>
  );
}
