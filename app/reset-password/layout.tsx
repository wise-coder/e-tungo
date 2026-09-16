import type { ReactNode } from "react";
import { createPrivateMetadata } from "@/lib/seo";

export const metadata = createPrivateMetadata("Reset Password", "/reset-password");

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
