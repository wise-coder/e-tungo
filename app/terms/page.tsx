import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Use | e-tungo",
  description: "Terms of use for e-tungo livestock marketplace.",
};

async function getTermsData() {
  const fallback = {
    title: "Terms of Use",
    paragraphs: [
      "By using e-tungo, you agree to use the platform responsibly and honestly.",
      "Sellers are responsible for the accuracy of their listings. Do not post animals or products you do not own or intend to sell.",
      "Buyers are responsible for verifying animals before completing any transaction. e-tungo facilitates connections and is not responsible for the outcome of transactions.",
      "e-tungo reserves the right to remove listings that violate community standards or are reported as fraudulent.",
      "These terms may be updated at any time. Continued use of the platform implies acceptance.",
    ],
  };

  try {
    const res = await fetch("https://e-tungo.vercel.app/terms", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const content = mainMatch ? mainMatch[1] : html;

    const titleMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : fallback.title;

    const paragraphs = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, "").trim())
      .filter((p) => p.length > 0 && !p.startsWith("←") && !p.includes("©"));

    return {
      title,
      paragraphs: paragraphs.length > 0 ? paragraphs : fallback.paragraphs,
    };
  } catch {
    return fallback;
  }
}

export default async function TermsPage() {
  const data = await getTermsData();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
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
