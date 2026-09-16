import type { MetadataRoute } from "next";
import { getBootstrapData } from "@/lib/db";
import { absoluteUrl, SEO_CATEGORIES } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/browse"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/wanted"), lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
  const categoryPages: MetadataRoute.Sitemap = Object.keys(SEO_CATEGORIES).map((category) => ({
    url: absoluteUrl(`/category/${category}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  try {
    const { listings } = await getBootstrapData();
    const listingPages: MetadataRoute.Sitemap = listings
      .filter((listing) => listing.status === "active")
      .map((listing) => ({
        url: absoluteUrl(`/listing/${encodeURIComponent(listing.id)}`),
        lastModified: new Date(listing.postedAt),
        changeFrequency: "weekly",
        priority: 0.7,
        images: listing.images.filter((image) => /^https?:\/\//i.test(image)),
      }));

    return [...staticPages, ...categoryPages, ...listingPages];
  } catch (error) {
    console.error("Unable to load listings for sitemap:", error);
    return [...staticPages, ...categoryPages];
  }
}
