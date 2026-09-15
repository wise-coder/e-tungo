"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function EmailAuthForm({ mode }: { mode: "forgot" | "reset" }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    setEmail(fragment.get("email") ?? "");
    setToken(fragment.get("token") ?? "");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  const title = mode === "forgot" ? "Password recovery" : "Reset your password";
  const needsPassword = mode === "reset";
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(""); setMessage("");
    if (mode === "reset" && password !== confirm) { setError("Passwords do not match."); return; }
    const action = mode === "forgot" ? "forgot-password" : "reset-password";
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, token, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to complete the request.");
      setMessage(data.message);
      if (needsPassword) { setDone(true); setToken(""); }
      setPassword(""); setConfirm("");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to complete the request."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-md px-4 py-12">
    <h1 className="mb-4 text-2xl font-bold">{title}</h1>
    {!done && <form onSubmit={submit} className="space-y-4">
      <label className="block">Email<input aria-label="Email" className="input-field mt-1" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>
      {needsPassword && <label className="block">New password (15–128 characters)<input aria-label="Password" className="input-field mt-1" type="password" autoComplete="new-password" minLength={15} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
      {mode === "reset" && <label className="block">Confirm password<input className="input-field mt-1" type="password" autoComplete="new-password" required minLength={15} maxLength={128} value={confirm} onChange={e => setConfirm(e.target.value)} /></label>}
      <button className="w-full rounded-xl bg-brand-700 p-3 font-bold text-white disabled:opacity-50" disabled={busy || (mode === "reset" && !token)}>{busy ? "Please wait…" : title}</button>
    </form>}
    {mode === "reset" && !token && !done && <p role="alert">Open the reset link from your email, or request a new one below.</p>}
    {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
    {message && <p role="status" className="mt-4 text-brand-700">{message}</p>}
    <div className="mt-6 flex justify-between text-sm text-brand-700"><Link href="/signin">Sign in</Link><Link href="/forgot-password">Request password recovery</Link></div>
  </div>;
}
