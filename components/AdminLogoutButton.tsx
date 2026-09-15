"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AdminLogoutButton() {
  const router = useRouter();
  const { logout } = useApp();

  const handleLogout = async () => {
    if (!await logout()) return;
    router.push("/signin?redirect=/admin");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-red-300 hover:text-red-600"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
