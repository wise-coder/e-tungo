"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, User, List, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AccountPage() {
  const { t, hydrated, user, setUser, listings } = useApp();
  const router = useRouter();

  if (!hydrated) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="h-14 w-14 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-5 w-40 mx-auto mb-2 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-56 mx-auto rounded bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t.signIn}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Sign in to manage your listings and requests.
        </p>
        <Link
          href="/signin"
          className="block w-full py-4 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-center"
        >
          {t.signIn}
        </Link>
      </div>
    );
  }

  const myListings = listings.filter((l) => {
    const ownerEmail = user.email.trim().toLowerCase();
    return (
      l.sellerId === user.id ||
      l.sellerEmail?.trim().toLowerCase() === ownerEmail ||
      l.sellerPhone.trim().toLowerCase() === ownerEmail
    );
  });
  const activeCount = myListings.filter((l) => l.status === "active").length;
  const soldCount = myListings.filter((l) => l.status === "sold").length;

  const menuItems = [
    {
      icon: List,
      label: t.myListings,
      href: "/account/listings",
      badge: activeCount || undefined,
    },
    {
      icon: FileText,
      label: t.myRequests,
      href: "/account/requests",
    },
    {
      icon: User,
      label: t.profile,
      href: "/account/profile",
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Greeting */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-700 flex items-center justify-center overflow-hidden text-white font-bold text-2xl">
          {user.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profileImage}
              alt={`${user.name} profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">
            {t.hello}, {user.name.split(" ")[0]}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
          <p className="text-xs text-gray-400">{user.district}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-brand-700 rounded-2xl p-4 text-center text-white">
          <p className="text-2xl font-bold">{activeCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">{t.activeListings}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{soldCount}</p>
          <p className="text-xs text-gray-600 mt-0.5">{t.soldListings}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {menuItems.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
              i < menuItems.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <item.icon size={18} className="text-gray-600" />
            </div>
            <span className="flex-1 font-medium text-gray-800">{item.label}</span>
            {item.badge !== undefined && (
              <span className="bg-brand-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={() => {
          setUser(null);
          router.push("/");
        }}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-sm text-red-500 font-semibold hover:text-red-700 transition-colors"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}
