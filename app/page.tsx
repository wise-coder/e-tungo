"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function HomePage() {
  const { lang, user } = useApp();

  return (
    <div className="flex flex-col bg-white">
      {/* HERO SECTION */}
      <section
        className="relative flex min-h-[420px] sm:min-h-[450px] md:min-h-[470px] lg:min-h-[490px] items-center overflow-hidden bg-cover bg-[center_right] sm:bg-[center_right] md:bg-right bg-no-repeat px-6 md:px-12 py-10 md:py-12"
        style={{
          backgroundImage: "url('/home-image.png')",
        }}
      >
        {/* Subtle gradient overlay on mobile for high contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#034d85]/75 via-[#034d85]/35 to-transparent sm:from-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-2xl">
            {/* Eyebrow Tag */}
            <p className="text-xs sm:text-sm font-extrabold tracking-[0.15em] text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              {lang === "rw"
                ? "ISOKO RY'AMATUNGO MU RWANDA"
                : "RWANDA'S LIVESTOCK MARKETPLACE"}
            </p>

            {/* Main Headline */}
            <h1 className="mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-[3.25rem] lg:text-[3.65rem] font-extrabold sm:font-black text-white leading-[1.24] sm:leading-[1.2] tracking-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
              {lang === "rw" ? (
                <>
                  Gura kandi ugurishe{" "}
                  <span className="text-[#8ef99d]">amatungo,</span>
                  <br />
                  mu buryo bworoshye.
                </>
              ) : (
                <>
                  Buy and sell{" "}
                  <span className="text-[#8ef99d]">livestock,</span>
                  <br />
                  the easy way.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-[1.05rem] text-white font-medium max-w-xl leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              {lang === "rw"
                ? "Hura n'aborozi n'abacuruzi bizewe mu Rwanda hose. Byizewe, byoroshye, kandi bihamye."
                : "Connect with trusted farmers and sellers across Rwanda. Safe, simple, and reliable."}
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[rgb(0,167,52)] px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-colors hover:bg-[#008f2c]"
              >
                <span>{lang === "rw" ? "Reba Amatungo" : "Browse Livestock"}</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                href={user ? "/sell" : "/signup"}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-bold text-[rgb(0,167,52)] shadow-md transition-colors hover:bg-gray-100"
              >
                <span>{lang === "rw" ? "Tangira None" : "Get Started"}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
