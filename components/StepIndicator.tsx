"use client";
import { useApp } from "@/context/AppContext";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { t } = useApp();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < currentStep
                ? "bg-brand-700 w-6"
                : i === currentStep
                ? "bg-brand-700 w-8"
                : "bg-gray-200 w-6"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {t.step} {currentStep + 1} {t.of} {totalSteps}
      </p>
    </div>
  );
}
