import Link from "next/link";
import { fetchCompanyData } from "@/lib/fetch-company-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Read how e-tungo handles account and marketplace information for livestock buyers and sellers in Rwanda.",
  path: "/privacy",
});

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const data = await fetchCompanyData("/privacy");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        {data.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
