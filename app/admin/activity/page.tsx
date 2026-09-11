import Link from "next/link";
import { Clock3, ExternalLink } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const { activities } = await loadAdminDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a8178]">
              Admin / Activity
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#262424]">Activity</h1>
            <p className="mt-2 text-sm leading-6 text-[#6f655c]">
              A simple timeline of the latest users, listings, and requests.
            </p>
          </div>
          <Clock3 size={20} className="text-[#375d3f]" />
        </div>
      </section>

      <section className="space-y-3">
        {activities.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-start justify-between gap-4 rounded-[22px] border border-[#e6dfd5] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(37,32,27,0.05)] transition-colors hover:bg-[#faf8f4]"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#262424]">{item.title}</p>
              <p className="mt-1 text-sm text-[#6f655c]">{item.detail}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-[#8a8178]">
              <span>{formatTimeAgo(item.date, "en")}</span>
              <ExternalLink size={14} />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

