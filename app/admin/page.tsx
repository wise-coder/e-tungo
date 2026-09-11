import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardList, Megaphone, Users, Clock3 } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";

export const dynamic = "force-dynamic";

const shortcuts = [
  { href: "/admin/users", label: "Users", icon: Users, description: "See every account." },
  { href: "/admin/listings", label: "Listings", icon: ClipboardList, description: "Review product posts." },
  { href: "/admin/requests", label: "Requests", icon: Megaphone, description: "Track buyer requests." },
  { href: "/admin/boosts", label: "Boost review", icon: BarChart3, description: "Prepare paid verification." },
];

export default async function AdminOverviewPage() {
  const { users, listings, activeListings, openRequests, activities } =
    await loadAdminDashboardData();

  const cards = [
    { label: "Users", value: users.length },
    { label: "Listings", value: listings.length },
    { label: "Active", value: activeListings.length },
    { label: "Open requests", value: openRequests.length },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a8178]">
              Admin overview
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#262424] md:text-4xl">
              Simple control center for the whole site.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6f655c] md:text-base">
              Everything is split into dedicated pages so the dashboard stays clean, easy to read,
              and fast to manage.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:w-[360px]">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-[22px] border border-[#e6dfd5] bg-[#faf8f4] p-4"
              >
                <p className="text-sm font-medium text-[#6f655c]">{card.label}</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-[#262424]">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="group rounded-[24px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(37,32,27,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eff5ef] text-[#375d3f]">
                  <shortcut.icon size={18} />
                </div>
                <h2 className="mt-4 text-lg font-black tracking-tight text-[#262424]">
                  {shortcut.label}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#6f655c]">
                  {shortcut.description}
                </p>
              </div>
              <ArrowRight
                size={18}
                className="mt-1 text-[#375d3f] transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black tracking-tight text-[#262424]">Recent activity</h2>
              <p className="text-sm text-[#6f655c]">Latest changes across the platform.</p>
            </div>
            <Clock3 size={18} className="text-[#375d3f]" />
          </div>

          <div className="space-y-2">
            {activities.slice(0, 8).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-start justify-between gap-4 rounded-2xl border border-[#f0ebe4] px-4 py-3 transition-colors hover:bg-[#faf8f4]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#262424]">{item.title}</p>
                  <p className="truncate text-xs text-[#6f655c]">{item.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-[#8a8178]">
                  {formatTimeAgo(item.date, "en")}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]">
          <h2 className="text-lg font-black tracking-tight text-[#262424]">
            What this dashboard is for
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-[#6f655c]">
            <p>• Review every user account from its own page.</p>
            <p>• Manage listings on a dedicated listings page.</p>
            <p>• Track buyer requests separately.</p>
            <p>• Keep a simple boost review space ready for later verification work.</p>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-[#e6dfd5] bg-[#faf8f4] px-4 py-4 text-sm text-[#6f655c]">
            Active listings: <strong className="text-[#262424]">{activeListings.length}</strong>
            {" · "}
            Open requests: <strong className="text-[#262424]">{openRequests.length}</strong>
            {" · "}
            Users: <strong className="text-[#262424]">{users.length}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
