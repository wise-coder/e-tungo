import Link from "next/link";
import { ArrowUpRight, MapPin, Megaphone, Phone } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";
import AdminDeleteButton from "@/components/AdminDeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const { wantedRequests, openRequests } = await loadAdminDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a8178]">
              Admin / Requests
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#262424]">Requests</h1>
            <p className="mt-2 text-sm leading-6 text-[#6f655c]">
              Buyer wishes stay separate so sellers can quickly see demand and negotiate directly.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e6dfd5] bg-[#faf8f4] px-4 py-3 text-sm text-[#6f655c]">
            <strong className="text-[#262424]">{openRequests.length}</strong> open requests
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {wantedRequests.map((request) => (
          <article
            key={request.id}
            className="rounded-[26px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff5ef] text-[#375d3f]">
                <Megaphone size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-black tracking-tight text-[#262424]">
                    {request.title}
                  </h2>
                  <span className="rounded-full border border-[#e6dfd5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8178]">
                    {request.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#6f655c]">{request.buyerName}</p>
                <div className="mt-3 grid gap-2 text-sm text-[#6f655c] sm:grid-cols-2">
                  <div className="inline-flex items-center gap-2">
                    <MapPin size={15} className="text-[#375d3f]" />
                    {request.buyerDistrict}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Phone size={15} className="text-[#375d3f]" />
                    {request.buyerPhone}
                  </div>
                  <div>{request.quantity ?? "Quantity not set"}</div>
                  <div>{request.budget ?? "Budget not set"}</div>
                </div>
                {request.description ? (
                  <p className="mt-3 text-sm leading-6 text-[#6f655c]">{request.description}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0ebe4] pt-4">
              <p className="text-xs text-[#8a8178]">
                Posted {formatTimeAgo(request.postedAt, "en")}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={`/wanted/${request.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#375d3f]"
                >
                  Open request
                  <ArrowUpRight size={16} />
                </Link>
                <AdminDeleteButton
                  endpoint={`/api/admin/requests/${request.id}`}
                  confirmMessage={`Delete request "${request.title}"?`}
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

