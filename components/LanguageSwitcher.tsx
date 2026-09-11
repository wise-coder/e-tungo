"use client";
import { useApp } from "@/context/AppContext";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useApp();

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLang("rw")}
        className={`px-2 py-1 rounded font-medium transition-colors ${
          lang === "rw"
            ? "bg-brand-700 text-white"
            : "text-gray-600 hover:text-brand-700"
        }`}
        aria-label="Kinyarwanda"
      >
        {compact ? "RW" : "Kinyarwanda"}
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded font-medium transition-colors ${
          lang === "en"
            ? "bg-brand-700 text-white"
            : "text-gray-600 hover:text-brand-700"
        }`}
        aria-label="English"
      >
        {compact ? "EN" : "English"}
      </button>
    </div>
  );
}
