"use client";
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

export default function ShopClient({ products }: { products: Product[] }) {
  const { lang } = useStore();
  const tx = t[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-12">
        <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-2">{tx.collection}</p>
        <h1 className="text-4xl font-black tracking-widest text-white">{tx.shop}</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-32 text-gray-500">
          {lang === "mn" ? "Бүтээгдэхүүн байхгүй байна" : "No products available"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
