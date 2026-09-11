"use client";
import { useApp } from "@/context/AppContext";

interface PriceInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export default function PriceInput({
  value,
  onChange,
  label,
  required = false,
  placeholder = "e.g. 150000",
}: PriceInputProps) {
  const { t } = useApp();

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
          RWF
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode="numeric"
          className="input-field pl-14"
          required={required}
        />
      </div>
    </div>
  );
}
