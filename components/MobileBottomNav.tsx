"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MobileBottomNav() {
  const { t } = useApp();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffe6ca] border-t border-[#ebd2b4] safe-area-pb">
      <div className="flex items-stretch h-16">
        {/* Home */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isActive("/") ? "text-brand-700" : "text-gray-500"
          }`}
        >
          <Home size={20} strokeWidth={isActive("/") ? 2.5 : 1.8} />
          <span>{t.home}</span>
        </Link>

        {/* Browse */}
        <Link
          href="/browse"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isActive("/browse") ? "text-brand-700" : "text-gray-500"
          }`}
        >
          <Search size={20} strokeWidth={isActive("/browse") ? 2.5 : 1.8} />
          <span>{t.browse}</span>
        </Link>

        {/* Sell — center prominent button */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Link
            href="/sell"
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-brand-700 text-white shadow-lg -mt-4 transition-transform active:scale-95"
            aria-label={t.sell}
          >
            <Plus size={24} strokeWidth={2.5} />
            <span className="text-xs font-semibold leading-tight">{t.sell}</span>
          </Link>
        </div>

        {/* Wanted */}
        <Link
          href="/wanted"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isActive("/wanted") ? "text-brand-700" : "text-gray-500"
          }`}
        >
          <Heart size={20} strokeWidth={isActive("/wanted") ? 2.5 : 1.8} />
          <span>{t.wanted}</span>
        </Link>

        {/* Me */}
        <Link
          href="/account"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isActive("/account") || isActive("/account/listings") || isActive("/account/profile")
              ? "text-brand-700"
              : "text-gray-500"
          }`}
        >
          <User size={20} strokeWidth={isActive("/account") ? 2.5 : 1.8} />
          <span>{t.me}</span>
        </Link>
      </div>
    </nav>
  );
}
