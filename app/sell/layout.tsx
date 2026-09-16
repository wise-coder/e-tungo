import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Create a Listing", "/sell");

export default function SellLayout({ children }: { children: ReactNode }) {
  return children;
}
