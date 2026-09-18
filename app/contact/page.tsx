import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | e-tungo",
  description: "Get in touch with e-tungo support via Phone, WhatsApp, or Email.",
};

async function getContactData() {
  const fallback = {
    title: "Contact Us",
    subtitle: "Have a question or need help? Reach us through any of the channels below.",
    channels: [
      {
        icon: "📞",
        label: "Phone / WhatsApp",
        value: "0792633097",
        href: "https://wa.me/250792633097",
      },
      {
        icon: "✉️",
        label: "Email",
        value: "tungatechnologies@gmail.com",
        href: "mailto:tungatechnologies@gmail.com",
      },
    ],
  };

  try {
    const res = await fetch("https://e-tungo.vercel.app/contact", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const content = mainMatch ? mainMatch[1] : html;

    const titleMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : fallback.title;

    const subtitleMatch = content.match(/<p[^>]*class="[^"]*text-gray-600[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    const subtitle = subtitleMatch ? subtitleMatch[1].replace(/<[^>]+>/g, "").trim() : fallback.subtitle;

    const channelMatches = [
      ...content.matchAll(
        /<span[^>]*class="[^"]*text-2xl[^"]*"[^>]*>([\s\S]*?)<\/span>[\s\S]*?<p[^>]*class="[^"]*font-semibold[^"]*"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<p[^>]*class="[^"]*text-brand-700[^"]*"[^>]*>([\s\S]*?)<\/p>/gi
      ),
    ];

    const channels =
      channelMatches.length > 0
        ? channelMatches.map((m) => {
            const icon = m[1].replace(/<[^>]+>/g, "").trim() || "📞";
            const label = m[2].replace(/<[^>]+>/g, "").trim();
            const value = m[3].replace(/<[^>]+>/g, "").trim();
            const href = value.includes("@")
              ? `mailto:${value}`
              : `https://wa.me/25${value.replace(/\D/g, "")}`;
            return { icon, label, value, href };
          })
        : fallback.channels;

    return {
      title,
      subtitle,
      channels,
    };
  } catch {
    return fallback;
  }
}

export default async function ContactPage() {
  const data = await getContactData();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
      {data.subtitle && <p className="text-gray-600 mb-6">{data.subtitle}</p>}
      <div className="space-y-4">
        {data.channels.map((channel, index) => (
          <a
            key={index}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#104b27] transition-colors"
          >
            <span className="text-2xl">{channel.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{channel.label}</p>
              <p className="text-brand-700 font-medium">{channel.value}</p>
            </div>
          </a>
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
