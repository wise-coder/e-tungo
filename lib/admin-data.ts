import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminEmailFromCookies } from "./admin-auth";
import { getAllUsers, getBootstrapData } from "@/lib/db";

export type AdminActivityKind = "user" | "listing" | "request";

export type AdminActivityItem = {
  id: string;
  kind: AdminActivityKind;
  title: string;
  detail: string;
  date: string;
  href: string;
};

export async function loadAdminData() {
  if (!await getAdminEmailFromCookies(await cookies())) redirect("/signin?redirect=/admin");
  const [users, bootstrap] = await Promise.all([getAllUsers(), getBootstrapData()]);
  const { listings, wantedRequests } = bootstrap;

  const activeListings = listings.filter((listing) => listing.status === "active");
  const soldListings = listings.filter((listing) => listing.status === "sold");
  const openRequests = wantedRequests.filter((request) => request.status === "open");

  const listingCounts = new Map<string, number>();
  listings.forEach((listing) => {
    listingCounts.set(listing.sellerId, (listingCounts.get(listing.sellerId) ?? 0) + 1);
  });

  const activities: AdminActivityItem[] = [
    ...users.map((user) => ({
      id: `user-${user.id}`,
      kind: "user" as const,
      title: `User joined: ${user.name}`,
      detail: user.email,
      date: user.createdAt,
      href: `/farm/${user.id}`,
    })),
    ...listings.map((listing) => ({
      id: `listing-${listing.id}`,
      kind: "listing" as const,
      title: `Listing posted: ${listing.title}`,
      detail: `${listing.sellerName} · ${listing.district}`,
      date: listing.postedAt,
      href: `/listing/${listing.id}`,
    })),
    ...wantedRequests.map((request) => ({
      id: `request-${request.id}`,
      kind: "request" as const,
      title: `Request posted: ${request.title}`,
      detail: `${request.buyerName} · ${request.buyerDistrict}`,
      date: request.postedAt,
      href: `/wanted/${request.id}`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    users,
    listings,
    wantedRequests,
    activeListings,
    soldListings,
    openRequests,
    listingCounts,
    activities,
  };
}
