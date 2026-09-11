"use client";

import type { ListingCategory } from "@/lib/types";
import { CATEGORY_EMOJIS } from "@/lib/utils";

const BRAND_TONE =
  "grayscale(1) sepia(1) saturate(6) hue-rotate(78deg) brightness(0.56) contrast(1.05)";
const LIGHT_TONE = "brightness(0) invert(1)";

export default function CategoryIcon({
  category,
  size = 18,
  className = "",
  tone = "brand",
}: {
  category: ListingCategory;
  size?: number;
  className?: string;
  tone?: "brand" | "light";
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        filter: tone === "light" ? LIGHT_TONE : BRAND_TONE,
      }}
    >
      {CATEGORY_EMOJIS[category]}
    </span>
  );
}
