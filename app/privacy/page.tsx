import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | e-tungo",
  description: "Privacy policy for e-tungo livestock marketplace.",
};

async function getPrivacyData() {
  const fallback = {
    title: "Privacy Policy",
    paragraphs: [
      "e-tungo collects minimal personal information: your name, email address, and district. If you choose to post buyer requests or add a contact number to a listing, that contact detail is stored with the post.",
      "Email is used to sign in. Contact details you provide for listings or requests are not shared with third parties without your consent.",
      "Listings you create are public and visible to all visitors of the platform.",
      "You can delete your listings and account at any time.",
      "We take reasonable measures to protect your data but cannot guarantee absolute security.",
    ],
  };

  try {
    const res = await fetch("https://e-tungo.vercel.app/privacy", {
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

export default async function PrivacyPage() {
  const data = await getPrivacyData();

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
