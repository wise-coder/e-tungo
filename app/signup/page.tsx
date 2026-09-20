"use client";

import { useState, Suspense, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User as UserIcon, Phone, LoaderCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { safeRedirect } from "@/lib/auth-client";
import { normalizeRwandaMobile } from "@/lib/phone";

function SignUpContent() {
  const { t, setUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = safeRedirect(searchParams.get("redirect"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!normalizeRwandaMobile(phone)) {
      setError("Enter a valid Rwanda mobile number, such as 0781234567.");
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
    if (password.length < 15 || password.length > 128) {
      setError("Use a password with 15–128 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, phone, district, password }),
      });
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        throw new Error("Unable to connect to server. Please try again.");
      }
      if (!response.ok) throw new Error(data?.error || "Unable to register.");
      setUser(data.user);
      setPassword("");
      setConfirmPassword("");
      router.push(data.admin ? "/admin" : redirect);
      router.refresh();
      // Keep loading until navigation unmounts this form.
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to register.");
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

              <div>
                <label htmlFor="signup-phone" className="mb-1.5 block text-sm font-semibold text-gray-700">Mobile number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="signup-phone" type="tel" inputMode="tel" autoComplete="tel" required
                    value={phone} onChange={event => { setPhone(event.target.value); setError(""); }}
                    placeholder="078 123 4567" className="input-field pl-11" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Buyers will use this number to call or WhatsApp you about your listings.</p>
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
                      minLength={15}
                      maxLength={128}
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

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
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
                  {busy ? t.loading : t.signUpWithEmail}
                </span>
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#efefeb] flex items-center justify-center text-gray-400">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
