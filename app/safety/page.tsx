import Link from "next/link";
import { Check } from "lucide-react";
import { fetchCompanyData } from "@/lib/fetch-company-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Livestock Marketplace Safety Tips",
  description: "Read practical safety tips for buying livestock and animal products from sellers in Rwanda through e-tungo.",
  path: "/safety",
});

export const dynamic = "force-dynamic";

export default async function SafetyPage() {
  const data = await fetchCompanyData("/safety");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{data.title}</h1>
      <ul className="space-y-4">
        {data.listItems.map((item, index) => (
          <li key={index} className="flex items-start gap-3.5">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 mt-0.5">
              <Check size={14} strokeWidth={2.5} />
            </span>
            <span className="text-base text-gray-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
