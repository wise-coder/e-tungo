import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Use</h1>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p>By using e-tungo, you agree to use the platform responsibly and honestly.</p>
        <p>Sellers are responsible for the accuracy of their listings. Do not post animals or products you do not own or intend to sell.</p>
        <p>Buyers are responsible for verifying animals before completing any transaction. e-tungo facilitates connections and is not responsible for the outcome of transactions.</p>
        <p>e-tungo reserves the right to remove listings that violate community standards or are reported as fraudulent.</p>
        <p>These terms may be updated at any time. Continued use of the platform implies acceptance.</p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
