"use client";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Menu, X, Globe } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { lang, setLang, cartCount } = useStore();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const tx = t[lang];
  const count = cartCount();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="VAST" width={40} height={40} />
          <span className="text-white font-bold text-lg tracking-widest">VAST</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-white transition text-sm tracking-wider">
            {tx.home}
          </Link>
          <Link href="/shop" className="text-gray-300 hover:text-white transition text-sm tracking-wider">
            {tx.shop}
          </Link>
          {session?.user && (
            <Link href="/orders" className="text-gray-300 hover:text-white transition text-sm tracking-wider">
              {tx.myOrders}
            </Link>
          )}
          {(session?.user as any)?.isAdmin && (
            <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition text-sm tracking-wider">
              {tx.admin}
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <button
            onClick={() => setLang(lang === "mn" ? "en" : "mn")}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition text-sm"
          >
            <Globe size={16} />
            {lang === "mn" ? "EN" : "МН"}
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative text-gray-300 hover:text-white transition">
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {session?.user ? (
            <button
              onClick={() => signOut()}
              className="hidden md:block text-gray-400 hover:text-white transition text-sm"
            >
              {tx.logout}
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:block bg-white text-black px-4 py-1.5 text-sm font-semibold tracking-wider hover:bg-gray-200 transition"
            >
              {tx.login}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-gray-300 text-sm tracking-wider">{tx.home}</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-gray-300 text-sm tracking-wider">{tx.shop}</Link>
          {session?.user && (
            <Link href="/orders" onClick={() => setMenuOpen(false)} className="text-gray-300 text-sm tracking-wider">{tx.myOrders}</Link>
          )}
          {(session?.user as any)?.isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-yellow-400 text-sm tracking-wider">{tx.admin}</Link>
          )}
          {session?.user ? (
            <button onClick={() => signOut()} className="text-left text-gray-400 text-sm">{tx.logout}</button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white text-sm">{tx.login}</Link>
          )}
        </div>
      )}
    </nav>
  );
}
