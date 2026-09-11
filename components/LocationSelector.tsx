"use client";
import { MapPin } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface LocationSelectorProps {
  value: string;
  onChange: (district: string) => void;
  required?: boolean;
  label?: string;
}

export default function LocationSelector({
  value,
  onChange,
  required = false,
  label,
}: LocationSelectorProps) {
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
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-9"
          required={required}
        >
          <option value="">{t.allDistricts}</option>
          {t.districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
