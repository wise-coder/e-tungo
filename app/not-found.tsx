import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5ec] text-[#104b27] mb-4">
        <AlertCircle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-500 text-sm mb-6">
        This page does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-[#104b27] hover:bg-[#0c3c1f] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
