import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Safety Tips | e-tungo",
  description: "Safety tips and guidelines for buying and selling livestock on e-tungo.",
};

async function getSafetyData() {
  const fallback = {
    title: "Safety Tips",
    items: [
      "Always meet the seller in a safe, public place when possible.",
      "Inspect the animal in person before making any payment.",
      "Prefer sellers with a verified badge or complete contact details.",
      "Never send money before seeing the animal or product.",
      "Report suspicious listings using the Report button on listing pages.",
    ],
  };

  try {
    const res = await fetch("https://e-tungo.vercel.app/safety", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const content = mainMatch ? mainMatch[1] : html;

    const titleMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : fallback.title;

    const itemMatches = [...content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((m) =>
        m[1]
          .replace(/<[^>]+>/g, "")
          .replace(/^[✅✔✓☑\s]+/, "")
          .trim()
      )
      .filter(Boolean);

    return {
      title,
      items: itemMatches.length > 0 ? itemMatches : fallback.items,
    };
  } catch {
    return fallback;
  }
}

export default async function SafetyPage() {
  const data = await getSafetyData();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{data.title}</h1>
      <ul className="space-y-4">
        {data.items.map((item, index) => (
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
