"use client";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

interface SearchBarProps {
  large?: boolean;
  initialValue?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ large = false, initialValue = "", onSearch }: SearchBarProps) {
  const { t } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 focus-within:border-brand-500 transition-colors ${large ? "py-3" : "py-2.5"}`}>
        <Search
          size={large ? 20 : 17}
          className="flex-shrink-0 text-gray-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400 ${large ? "text-base" : "text-sm"}`}
          aria-label={t.search}
        />
        <button
          type="submit"
          className={`flex-shrink-0 rounded-full bg-brand-700 font-semibold text-white transition-colors hover:bg-brand-800 ${large ? "px-5 py-2" : "px-3 py-1.5 text-sm"}`}
        >
          {t.search}
        </button>
      </div>
    </form>
  );
}
