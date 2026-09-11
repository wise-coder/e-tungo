"use client";
import { ListingCategory } from "@/lib/types";
import { ALL_CATEGORIES, getCategoryLabel } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import CategoryIcon from "./CategoryIcon";

interface CategorySelectorProps {
  selected?: ListingCategory | null;
  onSelect: (cat: ListingCategory) => void;
  showAll?: boolean;
}

export default function CategorySelector({ selected, onSelect, showAll = false }: CategorySelectorProps) {
  const { lang, t } = useApp();

  const categories = showAll ? ALL_CATEGORIES : ALL_CATEGORIES;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-left transition-all active:scale-95 ${
            selected === cat
              ? "border-brand-700 bg-brand-700 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-brand-700 hover:bg-gray-50"
          }`}
          aria-pressed={selected === cat}
        >
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${selected === cat ? "bg-white text-brand-700" : "bg-gray-100 text-brand-700"}`}>
            <CategoryIcon category={cat} size={18} />
          </span>
          <span className="text-xs font-semibold text-center leading-tight">
            {getCategoryLabel(cat, lang)}
          </span>
        </button>
      ))}
    </div>
  );
}
