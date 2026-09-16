import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Sign In", "/signin");

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
