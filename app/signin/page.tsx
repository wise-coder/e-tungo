"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import Logo from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import type { User } from "@/lib/types";
import { userIdFromEmail } from "@/lib/user-utils";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "tungatechnologies@gmail.com")
  .trim()
  .toLowerCase();

function buildUser(email: string, district: string, existing?: User): User {
  const emailName = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Member";
  const baseName = existing?.name?.trim() || emailName;
  return {
    id: existing?.id ?? userIdFromEmail(email),
    name: baseName,
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

export default function SignInPage() {
  const { t, setUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") ?? "/account";
  const defaultDistrict = t.districts[0];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === ADMIN_EMAIL) {
      const adminResponse = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!adminResponse.ok) {
        setError("Invalid admin credentials.");
        return;
      }

      setUser(null);
      router.push("/admin");
      return;
    }

    const response = await fetch(`/api/users?email=${encodeURIComponent(email.trim())}`);
    const existing = response.ok ? ((await response.json()) as User | null) : null;
    setUser(buildUser(email, existing?.district ?? defaultDistrict, existing ?? undefined));
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
              <h1 className="text-2xl font-bold text-gray-900">{t.signIn}</h1>
            </div>

            <form onSubmit={handleEmailSignIn} className="mt-6 space-y-4">
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-700 px-4 py-3.5 font-bold text-white transition-colors hover:bg-brand-800"
              >
                {t.signInWithEmail}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              {t.signUpSubtitle}{" "}
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirect)}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                {t.signUpWithEmail}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
