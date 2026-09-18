import Link from "next/link";
import { fetchCompanyData } from "@/lib/fetch-company-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact e-tungo",
  description: "Contact e-tungo for help using Rwanda's livestock and animal-products marketplace.",
  path: "/contact",
});

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const data = await fetchCompanyData("/contact");
  const channels = data.channels ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
      {data.subtitle && <p className="text-gray-600 mb-6">{data.subtitle}</p>}
      <div className="space-y-4">
        {channels.map((channel, index) => (
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
