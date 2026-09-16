import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Forgot Password", "/forgot-password");

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
