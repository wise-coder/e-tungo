"use client";
import { useApp } from "@/context/AppContext";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useApp();

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLang("rw")}
        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
          lang === "rw"
            ? "bg-[#104b27] text-white"
            : "text-gray-700 hover:text-[#104b27]"
        }`}
        aria-label="Kinyarwanda"
      >
        {compact ? "RW" : "Kinyarwanda"}
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
          lang === "en"
            ? "bg-[#104b27] text-white"
            : "text-gray-700 hover:text-[#104b27]"
        }`}
        aria-label="English"
      >
        {compact ? "EN" : "English"}
      </button>
    </div>
  );
}
