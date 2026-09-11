"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User as UserIcon } from "lucide-react";
import Logo from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import type { User } from "@/lib/types";
import { userIdFromEmail } from "@/lib/user-utils";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "tungatechnologies@gmail.com")
  .trim()
  .toLowerCase();

function buildUser(email: string, district: string, name: string, existing?: User): User {
  return {
    id: existing?.id ?? userIdFromEmail(email),
    name: name.trim() || existing?.name || email.split("@")[0] || "Member",
    email: email.trim(),
    district,
    userType: existing?.userType ?? "farmer",
    phone: existing?.phone,
    phoneVerified: existing?.phoneVerified ?? false,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    profileImage: existing?.profileImage,
    bio: existing?.bio,
  };
}

export default function SignUpPage() {
  const { t, setUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") ?? "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!district) {
      setError("Please select your district.");
      return;
    }
    if (!password.trim()) {
      setError("Please create a password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      setError("That email is reserved for admin access.");
      return;
    }

    const response = await fetch(`/api/users?email=${encodeURIComponent(email.trim())}`);
    const existing = response.ok ? ((await response.json()) as User | null) : null;
    setUser(buildUser(email, district, name, existing ?? undefined));
    router.push(redirect);
  };

  return (
    <div className="min-h-screen bg-[#efefeb]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4">
        <div className="flex items-center justify-between border-b border-black/10 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <Logo className="text-[1.9rem]" />
          <div className="w-[72px]" />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-[28px] border border-black/5 bg-white px-6 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
            <div className="text-center">
              <Logo className="mb-3 text-[2.4rem]" />
              <h1 className="text-2xl font-bold text-gray-900">{t.createAccount}</h1>
              <p className="mt-2 text-sm text-gray-500">{t.signUpSubtitle}</p>
            </div>

            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <UserIcon
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    placeholder="Jean Pierre"
                    autoComplete="name"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    {t.password}
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Password"
                      autoComplete="new-password"
                      className="input-field pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Confirm
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Password"
                      autoComplete="new-password"
                      className="input-field pl-11"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  {t.districtLabel}
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setError("");
                  }}
                  className="input-field"
                >
                  <option value="">Select district...</option>
                  {t.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-700 px-4 py-3.5 font-bold text-white transition-colors hover:bg-brand-800"
              >
                {t.signUpWithEmail}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              {t.signInSubtitle}{" "}
              <Link
                href={`/signin?redirect=${encodeURIComponent(redirect)}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                {t.signInWithEmail}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
