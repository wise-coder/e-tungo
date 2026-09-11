"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

type AdminBoostButtonProps = {
  endpoint: string;
  label?: string;
  confirmMessage?: string;
  className?: string;
};

export default function AdminBoostButton({
  endpoint,
  label = "Confirm boost",
  confirmMessage = "Confirm boost for this listing?",
  className = "",
}: AdminBoostButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBoost = async () => {
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch(endpoint, { method: "POST" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Boost failed");
      }
      router.refresh();
    } catch (boostError) {
      setError(boostError instanceof Error ? boostError.message : "Boost failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => void handleBoost()}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-full border border-[#d6e4d7] bg-[#eff5ef] px-3 py-2 text-xs font-semibold text-[#375d3f] transition-colors hover:border-[#375d3f] hover:bg-[#e5f0e6] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <Sparkles size={14} />
        {pending ? "Boosting..." : label}
      </button>
      {error ? <p className="text-[11px] text-[#b4533c]">{error}</p> : null}
    </div>
  );
}

