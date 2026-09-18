"use client";

import type { ListingCategory } from "@/lib/types";
import {
  Fish,
  Milk,
  Egg,
  Feather,
  Droplet,
  Package,
  Tag,
  Layers,
} from "lucide-react";

export default function CategoryIcon({
  category,
  size = 18,
  className = "",
}: {
  category: ListingCategory;
  size?: number;
  className?: string;
  tone?: "brand" | "light";
}) {
  switch (category) {
    case "fish":
      return <Fish size={size} className={className} />;
    case "milk":
      return <Milk size={size} className={className} />;
    case "eggs":
      return <Egg size={size} className={className} />;
    case "chickens":
      return <Feather size={size} className={className} />;
    case "honey":
      return <Droplet size={size} className={className} />;
    case "other":
      return <Package size={size} className={className} />;
    case "cattle":
    case "goats":
    case "sheep":
    case "pigs":
    case "rabbits":
    default:
      return <Tag size={size} className={className} />;
  }
}
