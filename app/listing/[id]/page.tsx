import { cache } from "react";
import type { Metadata } from "next";
import ListingDetailClient from "@/components/ListingDetailClient";
import { getListingById } from "@/lib/db";
import {
  absoluteUrl,
  INDEX_ROBOTS,
  listingSeoDescription,
  listingSeoTitle,
  NO_INDEX_ROBOTS,
  SITE_NAME,
  SOCIAL_IMAGE_PATH,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const loadListing = cache(async (id: string) => {
  try {
    return await getListingById(id);
  } catch (error) {
    console.error(`Unable to load listing ${id} for SEO:`, error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadListing(id);

  if (!listing) {
    return {
      title: "Listing not found",
      alternates: { canonical: `/listing/${encodeURIComponent(id)}` },
      robots: NO_INDEX_ROBOTS,
    };
  }

  const title = listingSeoTitle(listing);
  const description = listingSeoDescription(listing);
  const path = `/listing/${encodeURIComponent(listing.id)}`;
  const publicListing = listing.status === "active" || listing.status === "sold";
  const listingImage = listing.images.find((image) => /^https?:\/\//i.test(image) || image.startsWith("/"));
  const image = listingImage ? absoluteUrl(listingImage) : absoluteUrl(SOCIAL_IMAGE_PATH);
  const imageAlt = `${listing.title} for sale in ${listing.district}, Rwanda`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: publicListing ? INDEX_ROBOTS : NO_INDEX_ROBOTS,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_RW",
      type: "website",
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await loadListing(id);
  const isPublic = listing?.status === "active" || listing?.status === "sold";
  const productSchema = listing && isPublic
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listingSeoDescription(listing),
        image: listing.images
          .filter((image) => /^https?:\/\//i.test(image) || image.startsWith("/"))
          .map(absoluteUrl),
        url: absoluteUrl(`/listing/${encodeURIComponent(listing.id)}`),
        offers: {
          "@type": "Offer",
          price: listing.price.toString(),
          priceCurrency: "RWF",
          availability: listing.status === "sold"
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
          url: absoluteUrl(`/listing/${encodeURIComponent(listing.id)}`),
        },
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ListingDetailClient initialListing={listing} />
    </>
  );
}
