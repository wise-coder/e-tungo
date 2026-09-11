"use client";
import { useApp } from "@/context/AppContext";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  onCancel,
  onConfirm,
  confirmLabel,
  cancelLabel,
  danger = false,
}: ConfirmModalProps) {
  const { t } = useApp();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-sm mx-0 md:mx-4 p-6 shadow-xl">
        <p className="text-center text-gray-800 font-semibold text-base mb-6">
          {title}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-brand-700 hover:bg-brand-800"
            }`}
          >
            {confirmLabel ?? t.confirmSold}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {cancelLabel ?? t.cancelBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
