"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Logo from "./Logo";

export default function Footer() {
  const { t } = useApp();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="hidden md:block mt-auto border-t border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Logo className="text-[2.25rem]" />
            <p className="mt-1 text-sm text-gray-500">{t.tagline}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <Link href="/about" className="transition-colors hover:text-brand-700">
              {t.about}
            </Link>
            <Link href="/safety" className="transition-colors hover:text-brand-700">
              {t.safety}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-brand-700">
              {t.contact}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brand-700">
              {t.terms}
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-brand-700">
              {t.privacy}
            </Link>
          </nav>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} e-tungo. Rwanda.
        </p>
      </div>
    </footer>
  );
}
