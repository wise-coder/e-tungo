import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { getAdminEmailFromCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const adminEmail = getAdminEmailFromCookies(cookies());

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
