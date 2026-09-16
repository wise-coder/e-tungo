import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Your Account", "/account");

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
