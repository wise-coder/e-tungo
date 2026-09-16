import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About e-tungo",
  description: "Learn how e-tungo connects farmers, livestock sellers and buyers across Rwanda through a focused animal marketplace.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">About e-tungo</h1>
      <p className="text-gray-600 leading-relaxed mb-4">
        e-tungo is a simple digital marketplace focused on livestock and animal
        products in Rwanda. Our mission is to connect farmers, buyers, restaurants,
        butcheries, hotels, cooperatives and traders in a fast, easy and trustworthy way.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        <strong>Gura. Gurisha. Byoroshye.</strong> — Buy. Sell. Easily.
      </p>
      <p className="text-gray-600 leading-relaxed">
        e-tungo is built for everyone — from rural farmers with basic smartphones
        to businesses looking for reliable suppliers across Rwanda.
      </p>
      <div className="mt-8">
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
