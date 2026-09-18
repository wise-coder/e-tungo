"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import loadingLogo from "../public/e-tungo-loading-logo.png";

const COW_DURATION = 700;
const TEXT_DELAY = 260;
const TEXT_DURATION = 450;
const HOLD_DURATION = 1450;
const EXIT_DURATION = 500;
const SPLASH_BG = "#375d3f";
const SPLASH_FG = "#f6f2ea";

export default function SplashScreen() {
  const pathname = usePathname();
  const initialPathname = useRef(pathname);
  const [phase, setPhase] = useState<"enter" | "exit" | "hidden">("enter");
  const shouldShow = initialPathname.current === "/";

  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
    }, HOLD_DURATION);

    const hideTimer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow;
      setPhase("hidden");
    }, HOLD_DURATION + EXIT_DURATION);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldShow]);

  if (!shouldShow || phase === "hidden") {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center px-6 transition-opacity duration-500 ease-out ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: SPLASH_BG, color: SPLASH_FG }}
    >
      <div className="flex flex-col items-center justify-center text-current">
        <div
          className="transform-gpu"
          style={{
            animation: `splash-cow ${COW_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
          }}
        >
          <Image
            src={loadingLogo}
            alt="e-tungo"
            priority
            className="h-32 w-auto sm:h-36 md:h-40"
          />
        </div>
        <div
          className="mt-3 font-extrabold tracking-[-0.06em] text-3xl sm:text-4xl md:text-5xl"
          style={{
            animation: `splash-text ${TEXT_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) ${TEXT_DELAY}ms both`,
          }}
        >
          e-tungo
        </div>
      </div>
    </div>
  );
}
