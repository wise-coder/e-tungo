import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Livestock Wanted in Rwanda",
  description: "See livestock and animal products wanted by buyers across Rwanda and connect directly through e-tungo.",
  path: "/wanted",
});

export default function WantedLayout({ children }: { children: ReactNode }) {
  return children;
}
