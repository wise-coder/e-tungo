import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryListings from "@/components/CategoryListings";
import { createPageMetadata, isSeoCategory, SEO_CATEGORIES } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!isSeoCategory(category)) return { robots: { index: false, follow: false } };

  const details = SEO_CATEGORIES[category];
  return createPageMetadata({
    title: `${details.name} for Sale in Rwanda`,
    description: details.description,
    path: `/category/${category}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isSeoCategory(category)) notFound();

  return <CategoryListings category={category} categoryName={SEO_CATEGORIES[category].name} />;
}
