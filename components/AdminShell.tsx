"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  BarChart3,
  ClipboardList,
  Home,
  Megaphone,
  Users,
  Clock3,
} from "lucide-react";
import Logo from "./Logo";
import AdminLogoutButton from "./AdminLogoutButton";

type AdminShellProps = {
  adminEmail: string;
};

const navItems = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ClipboardList },
  { href: "/admin/analytics", label: "Marketplace Analytics", icon: BarChart3 },
  { href: "/admin/requests", label: "Requests", icon: Megaphone },
  { href: "/admin/boosts", label: "Boost review", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity", icon: Clock3 },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "bg-[#375d3f] text-white shadow-[0_12px_24px_rgba(55,93,63,0.18)]"
          : "text-[#4b453f] hover:bg-[#faf8f4] hover:text-[#262424]"
      }`}
    >
      <Icon size={17} className={active ? "text-white" : "text-[#375d3f]"} />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminShell({ adminEmail }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#ebd2b4] bg-[#ffe6ca] md:hidden">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Logo className="text-[1.9rem]" />
            <AdminLogoutButton />
          </div>
          <div className="mt-3 rounded-2xl border border-[#e6dfd5] bg-white px-3 py-2 text-xs text-[#6f655c]">
            {adminEmail}
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    active
                      ? "bg-[#375d3f] text-white"
                      : "border border-[#e6dfd5] bg-white text-[#4b453f]"
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-[#e6dfd5] md:bg-white">
        <div className="flex h-full flex-col p-5">
          <div>
            <Logo className="text-[2.1rem]" />
            <p className="mt-2 text-sm text-[#6f655c]">Admin control center</p>
          </div>

          <div className="mt-5 rounded-[22px] border border-[#e6dfd5] bg-[#faf8f4] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a8178]">
              Signed in
            </p>
            <p className="mt-1 break-all text-sm font-medium text-[#262424]">{adminEmail}</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                />
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
