import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Livestock Marketplace Safety Tips",
  description: "Read practical safety tips for buying livestock and animal products from sellers in Rwanda through e-tungo.",
  path: "/safety",
});

export default function SafetyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Safety Tips</h1>
      <ul className="space-y-4 text-gray-600">
        <li className="flex gap-3">
          <span className="text-xl flex-shrink-0">✅</span>
          <span>Always meet the seller in a safe, public place when possible.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-xl flex-shrink-0">✅</span>
          <span>Inspect the animal in person before making any payment.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-xl flex-shrink-0">✅</span>
          <span>Prefer sellers with a verified badge or complete contact details.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-xl flex-shrink-0">✅</span>
          <span>Never send money before seeing the animal or product.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-xl flex-shrink-0">✅</span>
          <span>Report suspicious listings using the Report button on listing pages.</span>
        </li>
      </ul>
      <div className="mt-8">
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
