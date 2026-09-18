import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { fetchCompanyData } from "@/lib/fetch-company-content";

export const metadata = createPageMetadata({
  title: "About e-tungo",
  description: "Learn how e-tungo connects farmers, livestock sellers and buyers across Rwanda through a focused animal marketplace.",
  path: "/about",
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const data = await fetchCompanyData("/about");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
      <div className="space-y-4 text-gray-600 leading-relaxed">
        {data.paragraphs.map((para, index) => (
          <p key={index}>{para}</p>
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
