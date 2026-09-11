"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type AdminDeleteButtonProps = {
  endpoint: string;
  label?: string;
  confirmMessage?: string;
  className?: string;
};

export default function AdminDeleteButton({
  endpoint,
  label = "Delete",
  confirmMessage = "Delete this item?",
  className = "",
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Delete failed");
      }
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-full border border-[#e8d8d4] bg-white px-3 py-2 text-xs font-semibold text-[#9f4c3e] transition-colors hover:border-[#dc9d8d] hover:bg-[#fff7f4] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <Trash2 size={14} />
        {pending ? "Deleting..." : label}
      </button>
      {error ? <p className="text-[11px] text-[#b4533c]">{error}</p> : null}
    </div>
  );
}

