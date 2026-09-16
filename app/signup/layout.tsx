import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Create an Account", "/signup");

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return children;
}
