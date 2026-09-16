import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { getAdminEmailFromCookies } from "@/lib/admin-auth";
import { createPrivateMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPrivateMetadata("Admin", "/admin");

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminEmail = await getAdminEmailFromCookies(await cookies());

  if (!adminEmail) {
    redirect("/signin?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-[#f3f1ed] md:flex">
      <AdminShell adminEmail={adminEmail} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}
