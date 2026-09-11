"use client";
import { ReactNode } from "react";

interface MobileActionBarProps {
  children: ReactNode;
}

/**
 * Sticky bottom bar on mobile — use for primary CTAs like "Call Seller"
 */
export default function MobileActionBar({ children }: MobileActionBarProps) {
  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
      {children}
    </div>
  );
}
