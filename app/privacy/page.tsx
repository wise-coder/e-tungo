import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Read how e-tungo handles account and marketplace information for livestock buyers and sellers in Rwanda.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p>e-tungo collects minimal personal information: your name, email address, and district. If you choose to post buyer requests or add a contact number to a listing, that contact detail is stored with the post.</p>
        <p>Email is used to sign in. Contact details you provide for listings or requests are not shared with third parties without your consent.</p>
        <p>Listings you create are public and visible to all visitors of the platform.</p>
        <p>You can delete your listings and account at any time.</p>
        <p>We take reasonable measures to protect your data but cannot guarantee absolute security.</p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
