"use client";

import { MessageCircle } from "lucide-react";

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL || "";

export default function WhatsAppButton() {
  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Horizon Jobs on WhatsApp"
      title="Contact Horizon Jobs on WhatsApp"
      className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl shadow-emerald-900/20 transition-all hover:scale-105"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}