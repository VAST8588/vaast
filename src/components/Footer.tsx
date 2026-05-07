"use client";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import { ExternalLink, MessageSquare } from "lucide-react";

export default function Footer() {
  const { lang } = useStore();
  const tx = t[lang];

  return (
    <footer className="bg-black border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/logo.png" alt="VAST" width={36} height={36} />
            <span className="text-white font-bold tracking-widest text-lg">VAST</span>
          </div>
          <p className="text-gray-500 text-sm">{tx.footerDesc}</p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3 tracking-wider text-sm">{tx.contact}</h4>
          <p className="text-gray-500 text-sm">vast@gmail.com</p>
          <p className="text-gray-500 text-sm mt-1">+976 85889977</p>
          <p className="text-gray-500 text-sm mt-1">Улаанбаатар, Монгол</p>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white font-semibold mb-3 tracking-wider text-sm">{tx.followUs}</h4>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <ExternalLink size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <MessageSquare size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center">
        <p className="text-gray-600 text-xs">© 2024 VAST. {tx.rights}.</p>
      </div>
    </footer>
  );
}
