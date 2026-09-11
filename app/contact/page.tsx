import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-6">
        Have a question or need help? Reach us through any of the channels below.
      </p>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
          <span className="text-2xl">📞</span>
          <div>
            <p className="font-semibold text-gray-900">Phone / WhatsApp</p>
            <p className="text-brand-700 font-medium">0792633097</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100">
          <span className="text-2xl">✉️</span>
          <div>
            <p className="font-semibold text-gray-900">Email</p>
            <p className="text-brand-700 font-medium">tungatechnologies@gmail.com</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-brand-700 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
