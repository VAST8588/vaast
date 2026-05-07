"use client";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { lang, cart, removeFromCart, updateQty, cartTotal } = useStore();
  const tx = t[lang];
  const total = cartTotal();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <p className="text-gray-500 text-lg mb-6">{tx.emptyCart}</p>
        <Link
          href="/shop"
          className="inline-block bg-white text-black px-8 py-3 font-bold tracking-wider text-sm hover:bg-gray-200 transition"
        >
          {tx.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black tracking-widest text-white mb-10">{tx.cartTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 bg-zinc-900 border border-white/5 p-4"
            >
              <div className="relative w-24 h-24 flex-shrink-0 bg-zinc-800">
                <Image src={item.image} alt={lang === "mn" ? item.nameMn : item.nameEn} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm tracking-wider">
                  {lang === "mn" ? item.nameMn : item.nameEn}
                </p>
                <p className="text-gray-500 text-xs mt-1">{tx.size}: {item.size}</p>
                <p className="text-white text-sm mt-2 font-bold">₮{item.price.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeFromCart(item.productId, item.size)}
                  className="text-gray-600 hover:text-red-400 transition"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center border border-white/20">
                  <button
                    onClick={() => updateQty(item.productId, item.size, item.quantity - 1)}
                    className="w-8 h-8 text-white hover:bg-white/10 transition text-sm"
                  >−</button>
                  <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.size, item.quantity + 1)}
                    className="w-8 h-8 text-white hover:bg-white/10 transition text-sm"
                  >+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-zinc-900 border border-white/5 p-6 h-fit">
          <h2 className="text-white font-bold tracking-wider mb-6 text-sm">{tx.total}</h2>
          <div className="flex justify-between text-white font-black text-xl mb-6">
            <span>{tx.total}</span>
            <span>₮{total.toLocaleString()}</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center bg-white text-black py-4 font-bold tracking-widest text-sm hover:bg-gray-200 transition"
          >
            {tx.checkout}
          </Link>
          <Link
            href="/shop"
            className="block text-center text-gray-500 text-xs mt-4 hover:text-white transition"
          >
            {tx.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}
