"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function Header() {
  const { t, user, lang } = useApp();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const isHome = pathname === "/";

  const navLinks = [
    { href: "/", label: t.home },
    { href: "/browse", label: t.browse },
    { href: "/wanted", label: t.wanted },
  ];

  if (isHome) {
    return (
      <header className="sticky top-0 z-40 border-b border-[#d8d3cc] bg-[#f3f1ed]">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5">
          <Logo className="text-[2.25rem]" />
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2b2623] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black"
          >
            <Plus size={16} />
            Add / Amamaza
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="hidden md:block sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Logo className="text-[2.25rem]" />

        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-brand-700"
                  : "text-gray-600 hover:text-brand-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          {user ? (
            <Link
              href="/account"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-700"
            >
              <User size={18} />
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand-700 hover:text-brand-700"
            >
              {t.signIn}
            </Link>
          )}
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            <Plus size={16} />
            {lang === "rw" ? "Amamaza" : "Add"}
          </Link>
        </div>
      </div>
    </header>
  );
}
