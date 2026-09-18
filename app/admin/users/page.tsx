import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { loadAdminDashboardData } from "@/lib/admin-dashboard-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { users, listingCounts } = await loadAdminDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a8178]">
              Admin / Users
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#262424]">Users</h1>
            <p className="mt-2 text-sm leading-6 text-[#6f655c]">
              Seller accounts and profile details live on this page alone, so the dashboard stays easy to scan.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e6dfd5] bg-[#faf8f4] px-4 py-3 text-sm text-[#6f655c]">
            <strong className="text-[#262424]">{users.length}</strong> total accounts
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => {
          const totalListings = listingCounts.get(user.id) ?? 0;

          return (
            <article
              key={user.id}
              className="rounded-[26px] border border-[#e6dfd5] bg-white p-5 shadow-[0_12px_24px_rgba(37,32,27,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#375d3f] text-lg font-bold text-white">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-[#262424]">{user.name}</h2>
                    <p className="text-sm text-[#6f655c]">{user.email}</p>
                  </div>
                </div>
                <div className="rounded-full border border-[#e6dfd5] bg-[#faf8f4] px-3 py-1 text-xs font-semibold text-[#375d3f]">
                  {user.userType}
                </div>
              </div>

              <dl className="mt-5 grid gap-3 text-sm text-[#6f655c]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2">
                    <MapPin size={15} className="text-[#375d3f]" />
                    District
                  </dt>
                  <dd className="font-medium text-[#262424]">{user.district}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2">
                    <Building2 size={15} className="text-[#375d3f]" />
                    Listings
                  </dt>
                  <dd className="font-medium text-[#262424]">{totalListings}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt>Joined</dt>
                  <dd className="font-medium text-[#262424]">{formatTimeAgo(user.createdAt, "en")}</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs text-[#8a8178]">{user.phone ?? "No phone saved"}</p>
                <Link
                  href={`/farm/${user.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#375d3f]"
                >
                  Open profile
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

