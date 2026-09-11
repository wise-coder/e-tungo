"use client";
import { ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface SellerCardProps {
  name: string;
  district: string;
  phoneVerified: boolean;
}

export default function SellerCard({ name, district, phoneVerified }: SellerCardProps) {
  const { t } = useApp();
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {t.seller}
      </h3>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{district}</p>
          {phoneVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-0.5">
              <ShieldCheck size={12} />
              {t.phoneVerified}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
