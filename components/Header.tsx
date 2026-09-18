"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Plus,
  Home,
  Search,
  ShoppingBag,
  Heart,
  Bell,
  User,
  LogIn,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function Header() {
  const { t, user, lang, setLang, logout } = useApp();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isHome = pathname === "/";

  // Close drawer on path change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (pathname.startsWith("/admin") || pathname === "/signin" || pathname === "/signup") return null;

  const navLinks = [
    { href: "/", label: t.home },
    { href: "/browse", label: t.browse },
    { href: "/wanted", label: t.wanted },
  ];

  const drawerRoutes = [
    { href: "/", label: t.home, icon: Home },
    { href: "/browse", label: t.browse, icon: Search },
    { href: "/wanted", label: t.wanted, icon: ShoppingBag },
    { href: "/account", label: lang === "rw" ? "Ibibitse" : "Saved", icon: Heart },
    { href: "/account", label: lang === "rw" ? "Ubutumwa" : "Alerts", icon: Bell },
    { href: "/account", label: lang === "rw" ? "Konti yanjye" : "Account", icon: User },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b ${
          isHome ? "border-gray-100 bg-white" : "border-[#ebd2b4] bg-[#ffe6ca]"
        }`}
      >
        {/* Main Navbar Row */}
        <div className="mx-auto flex h-16 md:h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
          {/* Logo */}
          <Logo className="text-[1.85rem] sm:text-[2rem] md:text-[2.15rem]" />

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-[#104b27] border-b-2 border-[#104b27]"
                      : "text-gray-700 hover:text-[#104b27]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher compact />

            {user ? (
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-gray-400 hover:text-[#104b27]"
              >
                <User size={16} />
                <span>{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-gray-400 hover:text-[#104b27]"
              >
                {t.signIn}
              </Link>
            )}

            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(0,167,52)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#008f2c]"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{lang === "rw" ? "Amamaza" : "Add"}</span>
            </Link>
          </div>

          {/* Mobile Right Controls (Language Switcher + Hamburger Button) */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#104b27] hover:bg-black/5 transition-colors"
            >
              <Menu size={24} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER (SIDEBAR) */}
      {/* Backdrop overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container */}
      <aside
        aria-label="Mobile navigation menu"
        className={`fixed top-0 right-0 bottom-0 z-50 w-[84%] max-w-[340px] bg-[#0f3822] text-white shadow-2xl flex flex-col justify-between p-5 transition-transform duration-300 ease-out md:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Top Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Drawer Header: Logo + Language Toggle + Close Button */}
          <div className="flex items-center justify-between gap-2 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">e-tungo</span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Language toggle pill */}
              <button
                type="button"
                onClick={() => setLang(lang === "rw" ? "en" : "rw")}
                className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-white/20"
                aria-label="Toggle language"
              >
                <span>{lang === "rw" ? "RW" : "EN"}</span>
                <ChevronDown size={14} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Large Green Primary Action: + Add Listing */}
          <Link
            href="/sell"
            onClick={() => setDrawerOpen(false)}
            className="mt-2 mb-4 flex items-center justify-center gap-2 w-full rounded-xl bg-[#4ea832] hover:bg-[#43952a] text-white font-bold py-3 px-4 shadow-sm transition-all active:scale-[0.98] text-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>{lang === "rw" ? "+ Shyiraho Itangazo" : "+ Add Listing"}</span>
          </Link>

          {/* Main Navigation Routes */}
          <nav className="space-y-1">
            {drawerRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.label + route.href}
                  href={route.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-white/15 text-white font-semibold shadow-inner"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-white/80 shrink-0" />
                    <span className="text-sm">{route.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-white/50" />
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-white/10 my-4" />

          {/* Secondary Links */}
          <div className="space-y-2.5 px-3">
            <Link
              href="/about"
              onClick={() => setDrawerOpen(false)}
              className="block text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
            >
              {lang === "rw" ? "Abo turibo" : "About Us"}
            </Link>
            <Link
              href="/contact"
              onClick={() => setDrawerOpen(false)}
              className="block text-xs sm:text-sm text-white/70 hover:text-white transition-colors"
            >
              {lang === "rw" ? "Twandikire" : "Contact Support"}
            </Link>
          </div>
        </div>

        {/* Drawer Bottom Bar */}
        <div className="border-t border-white/15 pt-3.5 mt-2 flex items-center justify-between text-xs text-white/60">
          {user ? (
            <button
              type="button"
              onClick={async () => {
                await logout();
                setDrawerOpen(false);
              }}
              className="flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors"
            >
              <LogOut size={16} />
              <span>{lang === "rw" ? "Sohoka" : "Sign Out"}</span>
            </button>
          ) : (
            <Link
              href="/signin"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors"
            >
              <LogIn size={16} />
              <span>{t.signIn}</span>
            </Link>
          )}

          <span className="text-[11px] text-white/40">v2.1 © e-tungo</span>
        </div>
      </aside>
    </>
  );
}
