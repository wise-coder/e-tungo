"use client";

import { useState, Suspense, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, LoaderCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { safeRedirect } from "@/lib/auth-client";

function SignInContent() {
  const { t, setUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = safeRedirect(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        throw new Error("Unable to connect to server. Please try again.");
      }
      if (!response.ok) throw new Error(data?.error || "Unable to sign in.");
      setUser(data.user);
      setPassword("");
      router.push(data.admin ? "/admin" : redirect);
      router.refresh();
      // Keep loading until navigation unmounts this form.
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefeb]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4">
        <div className="flex items-center justify-between border-b border-black/10 py-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back
          </button>
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

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                aria-busy={busy}
                className="w-full rounded-2xl bg-brand-700 px-4 py-3.5 font-bold text-white transition-colors hover:bg-brand-800 disabled:cursor-wait"
              >
                <span role="status" className="flex items-center justify-center gap-2">
                  {busy && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
                  {busy ? t.loading : t.signInWithEmail}
                </span>
              </button>
            </form>

            <div className="mt-4 text-sm text-brand-700">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
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

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#efefeb] flex items-center justify-center text-gray-400">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
