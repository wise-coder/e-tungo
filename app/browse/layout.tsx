import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Browse Livestock and Animal Products in Rwanda",
  description: "Browse active cattle, goats, pigs, chickens, rabbits, milk, eggs, honey and other animal-product listings across Rwanda.",
  path: "/browse",
});

export default function BrowseLayout({ children }: { children: ReactNode }) {
  return children;
}
