import Link from "next/link";
import { ReactNode } from "react";
import { Search } from "lucide-react";

interface EmptyStateProps {
  emoji?: string;
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-700 text-white">
        {icon ?? <Search size={28} />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-950">{title}</h3>
      <p className="max-w-xs text-sm leading-6 text-gray-500">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
