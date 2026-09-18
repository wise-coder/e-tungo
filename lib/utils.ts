import { ListingCategory } from "./types";
import { translations } from "./translations";

export function formatPrice(price: number): string {
  return price.toLocaleString("rw-RW") + " RWF";
}

export function formatTimeAgo(dateString: string, lang: "en" | "rw" = "en"): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lang === "rw") {
    if (diffMins < 60) return `Iminota ${diffMins}`;
    if (diffHours < 24) return translations.rw.postedToday;
    if (diffDays === 1) return translations.rw.postedYesterday;
    return `Iminsi ${diffDays}`;
  }
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function getCategoryLabel(category: ListingCategory, lang: "en" | "rw"): string {
  const t = translations[lang];
  const map: Record<ListingCategory, string> = {
    cattle: t.cattle,
    goats: t.goats,
    sheep: t.sheep,
    pigs: t.pigs,
    chickens: t.chickens,
    rabbits: t.rabbits,
    fish: t.fish,
    milk: t.milk,
    eggs: t.eggs,
    honey: t.honey,
    other: t.other,
  };
  return map[category] ?? category;
}

export const CATEGORY_EMOJIS: Record<ListingCategory, string> = {
  cattle: "",
  goats: "",
  sheep: "",
  pigs: "",
  chickens: "",
  rabbits: "",
  fish: "",
  milk: "",
  eggs: "",
  honey: "",
  other: "",
};

export const ALL_CATEGORIES: ListingCategory[] = [
  "cattle",
  "goats",
  "sheep",
  "pigs",
  "chickens",
  "rabbits",
  "fish",
  "milk",
  "eggs",
  "honey",
  "other",
];
