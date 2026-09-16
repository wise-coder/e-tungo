import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getWantedRequestById } from "@/lib/db";
import { createPageMetadata, NO_INDEX_ROBOTS } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const request = await getWantedRequestById(id);
    if (!request) return { title: "Wanted request not found", robots: NO_INDEX_ROBOTS };

    return createPageMetadata({
      title: `${request.title} Wanted in ${request.buyerDistrict}`,
      description: `${request.title} wanted in ${request.buyerDistrict}, Rwanda. View this buyer request and contact details on e-tungo.`,
      path: `/wanted/${encodeURIComponent(request.id)}`,
    });
  } catch {
    return { title: "Wanted request", robots: NO_INDEX_ROBOTS };
  }
}

export default function WantedDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
