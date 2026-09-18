"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function Footer() {
  const { lang } = useApp();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-gray-100 text-gray-600 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">e-tungo</span>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-gray-600 max-w-md leading-relaxed">
              {lang === "rw"
                ? "Amatungo mazima. Imibereho myiza. Isoko rya mbere ry'ubuhinzi n'ubworozi rihuza aborozi n'abaguzi."
                : "Healthy animals. Better livelihoods. The premier agricultural marketplace connecting farmers and buyers."}
            </p>

            {/* Contact quick links: WhatsApp & Gmail */}
            <div className="mt-5 flex items-center gap-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/250792633097"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp: 0792633097"
                title="WhatsApp: 0792633097"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 transition-all hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Gmail / Email */}
              <a
                href="mailto:tungatechnologies@gmail.com"
                aria-label="Email: tungatechnologies@gmail.com"
                title="Email: tungatechnologies@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 transition-all hover:bg-[#EA4335] hover:text-white hover:border-[#EA4335]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              </a>
            </div>

            {/* Raised Copyright Notice */}
            <p className="mt-6 text-xs text-gray-400">
              © {new Date().getFullYear()} e-tungo. All rights reserved.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 gap-6 sm:gap-8">
            {/* Marketplace */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                {lang === "rw" ? "ISOKO" : "MARKETPLACE"}
              </h3>
              <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="/browse" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Amatungo Ari ku Isoko" : "Browse Animals"}
                  </Link>
                </li>
                <li>
                  <Link href="/wanted" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Ibyo Abakiriya Bashaka" : "Wanted Requests"}
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Amamaza Itungo" : "Post a Listing"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                {lang === "rw" ? "KOMPANYI" : "COMPANY"}
              </h3>
              <ul className="mt-3.5 space-y-2.5 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="/about" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Abo Turibo" : "About Us"}
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Umutekano" : "Safety Tips"}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Amabwiriza yo Gukoresha" : "Terms of Service"}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Amategeko y'Ubuzima Bwite" : "Privacy Policy"}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-900 transition-colors">
                    {lang === "rw" ? "Ubufasha" : "Contact Support"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
