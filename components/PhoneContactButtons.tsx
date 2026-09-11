"use client";
import { useState } from "react";
import { Phone, MessageCircle, Mail, Copy } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface PhoneContactButtonsProps {
  phone: string;
  sellerName: string;
  listingTitle: string;
}

export default function PhoneContactButtons({ phone, sellerName, listingTitle }: PhoneContactButtonsProps) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  const cleanPhone = phone.replace(/\s+/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hello, I'm interested in your listing: ${listingTitle} on e-tungo.`
  );

  if (phone.includes("@")) {
    const copyEmail = async () => {
      try {
        await navigator.clipboard.writeText(phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // ignore clipboard failures
      }
    };

    return (
      <div className="flex gap-3">
        <a
          href={`mailto:${phone}?subject=${encodeURIComponent(`Interested in ${listingTitle}`)}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-700 py-4 font-semibold text-white transition-colors hover:bg-brand-800 active:scale-95"
          aria-label={`${t.email} ${sellerName}`}
        >
          <Mail size={20} />
          {t.email}
        </a>
        <button
          type="button"
          onClick={copyEmail}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-900 py-4 font-semibold text-white transition-colors hover:bg-gray-800 active:scale-95"
          aria-label={`Copy ${sellerName} email`}
        >
          <Copy size={20} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <a
        href={`tel:${cleanPhone}`}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-700 py-4 font-semibold text-white transition-colors hover:bg-brand-800 active:scale-95"
        aria-label={`${t.callSeller} ${sellerName}`}
      >
        <Phone size={20} />
        {t.callSeller}
      </a>
      <a
        href={`https://wa.me/${cleanPhone.replace("+", "")}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-900 py-4 font-semibold text-white transition-colors hover:bg-gray-800 active:scale-95"
        aria-label={`WhatsApp ${sellerName}`}
      >
        <MessageCircle size={20} />
        {t.whatsappSeller}
      </a>
    </div>
  );
}
