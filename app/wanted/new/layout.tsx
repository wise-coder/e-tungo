import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Post a Wanted Request", "/wanted/new");

export default function NewWantedLayout({ children }: { children: ReactNode }) {
  return children;
}
