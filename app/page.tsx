"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function HomePage() {
  const { lang } = useApp();

  return (
    <div className="min-h-screen bg-[#f3f1ed]">
      <section className="border-b border-[#e1dbd3] px-4 pb-6 pt-6 md:pb-8 md:pt-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mx-auto max-w-4xl text-2xl font-black tracking-tight text-[#262424] sm:text-3xl md:text-4xl lg:text-5xl">
              {lang === "rw"
                ? "Menyekanisha amatungo yizewe mu Rwanda."
                : "Show trusted livestock across Rwanda."}
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[#6a5f56] md:text-base">
              {lang === "rw"
                ? "Shakisha amatungo ari ku isoko n'ibikomoka ku matungo byizewe, cyangwa utangaze ibyo ufite mu buryo bworoshye."
                : "Browse verified livestock and farm products, or list what you have in a simple, professional flow."}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:py-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-black tracking-tight text-[#262424] md:text-3xl">
              Choose / Hitamo?
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 md:gap-6">
            <Link
              href="/browse"
              className="group rounded-[24px] border border-[#ebe5dd] bg-white p-5 shadow-[0_20px_40px_rgba(37,32,27,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(37,32,27,0.12)] md:p-6"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ef] text-[#3d6545] md:mb-8 md:h-14 md:w-14">
                <span className="text-xl leading-none" aria-hidden="true">
                  🐮
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-[#262424] md:text-2xl">
                {lang === "rw" ? "Amatungo ari ku isoko" : "Assets / Imari"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#5f564e] md:text-base">
                {lang === "rw"
                  ? "Reba amatungo yizewe, ibikomoka ku matungo n'ibindi byashyizwe ku isoko n'abacuruzi bo mu gihugu hose."
                  : "Explore verified livestock and farm products from sellers across Rwanda."}
              </p>
              <p className="mt-2 max-w-md text-xs italic leading-5 text-[#7a7168] md:text-sm">
                {lang === "rw"
                  ? "Shakisha inyamaswa, amata, amagi n'ibindi byerekanwe neza kandi mu buryo busobanutse."
                  : "Browse clear listings with only the essentials, presented in a calm and professional way."}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#375d3f] transition-colors group-hover:text-[#2a4630]">
                {lang === "rw" ? "Reba amatangazo" : "Browse listings"}
                <ArrowRight size={14} />
              </div>
            </Link>

            <Link
              href="/sell"
              className="group rounded-[24px] border border-[#ebe5dd] bg-white p-5 shadow-[0_20px_40px_rgba(37,32,27,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(37,32,27,0.12)] md:p-6"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5ede7] text-[#c46f37] md:mb-8 md:h-14 md:w-14">
                <Megaphone size={20} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-[#262424] md:text-2xl">
                {lang === "rw" ? "Menyekanisha" : "Add / Amamaza"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#5f564e] md:text-base">
                {lang === "rw"
                  ? "Tangaza ibyo ufite, wemeze abasoma itangazo ryawe, kandi uhuze n'abaguzi mu buryo bwihuse."
                  : "Post what you have and connect with buyers through a simple, verified listing flow."}
              </p>
              <p className="mt-2 max-w-md text-xs italic leading-5 text-[#7a7168] md:text-sm">
                {lang === "rw"
                  ? "Buri itangazo rigaragara neza, ryoroshye gusoma, kandi ririmo ibisobanuro bikenewe gusa."
                  : "Every listing is clean, readable, and focused on the information people actually need."}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#c46f37] transition-colors group-hover:text-[#9f5e2f]">
                {lang === "rw" ? "Tangira none" : "Post now"}
                <ArrowRight size={14} />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
