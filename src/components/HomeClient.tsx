"use client";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  nameEn: string;
  nameMn: string;
  descEn: string;
  descMn: string;
  price: number;
  images: string;
  sizes: string;
  stock: number;
};

export default function HomeClient({ products }: { products: Product[] }) {
  const { lang } = useStore();
  const tx = t[lang];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/banner.png"
            alt="VAST Banner"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src="/logo.png" alt="VAST" width={56} height={56} />
          </div>
          <p className="text-xs tracking-[0.4em] text-gray-400 mb-4 uppercase">
            {tx.newDrop} — {tx.collection}
          </p>
          <h1 className="text-5xl md:text-8xl font-black tracking-widest text-white mb-6 leading-none">
            {tx.heroTitle}
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-md mx-auto">
            {tx.heroSubtitle}
          </p>
          <Link
            href="/shop"
            className="inline-block bg-white text-black px-10 py-4 font-bold tracking-widest text-sm hover:bg-gray-200 transition-all duration-300"
          >
            {tx.shopNow}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { label: lang === "mn" ? "Орчин үеийн дизайн" : "Modern Design", sub: lang === "mn" ? "Цаг үеэс хэтэрсэн" : "Timeless Aesthetic" },
            { label: lang === "mn" ? "Өндөр чанар" : "Premium Quality", sub: lang === "mn" ? "Удаан эдлэхүйц" : "Built to Last" },
            { label: lang === "mn" ? "Дэлхийн алдар" : "Global Vision", sub: lang === "mn" ? "Дэлхий даяар өмссөн" : "Worn Worldwide" },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-white text-xs font-semibold tracking-wider">{f.label}</p>
              <p className="text-gray-500 text-xs mt-1">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold tracking-widest text-white">
            {tx.newDrop}
          </h2>
          <Link href="/shop" className="text-gray-400 text-sm hover:text-white transition tracking-wider">
            {tx.shopNow} →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">
              {lang === "mn"
                ? "Бүтээгдэхүүн байхгүй байна. /api/seed руу орж эхлүүлнэ үү."
                : "No products yet. Visit /api/seed to initialize."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
