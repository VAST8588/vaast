"use client";
import Image from "next/image";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, ShoppingBag } from "lucide-react";

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

export default function ProductClient({ product }: { product: Product }) {
  const { lang, addToCart } = useStore();
  const tx = t[lang];
  const { data: session } = useSession();
  const router = useRouter();

  const images = product.images.split(",");
  const sizes = product.sizes.split(",");

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const name = lang === "mn" ? product.nameMn : product.nameEn;
  const desc = lang === "mn" ? product.descMn : product.descEn;

  function handleAdd() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (!selectedSize) return;

    addToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameMn: product.nameMn,
      price: product.price,
      size: selectedSize,
      quantity: qty,
      image: images[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-zinc-900 mb-3 overflow-hidden">
            <Image
              src={images[selectedImg] || "/products/placeholder.jpg"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`relative w-20 h-20 border-2 overflow-hidden transition ${
                    selectedImg === i ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-2">VAST</p>
            <h1 className="text-3xl font-black tracking-wide text-white">{name}</h1>
            <p className="text-2xl text-white mt-3 font-bold">₮{product.price.toLocaleString()}</p>
          </div>

          <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>

          {/* Size */}
          <div>
            <p className="text-white text-sm font-semibold mb-3 tracking-wider">{tx.size}</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-12 h-12 border text-sm font-semibold transition ${
                    selectedSize === s
                      ? "border-white bg-white text-black"
                      : "border-white/20 text-gray-400 hover:border-white hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-gray-600 text-xs mt-2">{tx.selectSize}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-white text-sm font-semibold tracking-wider">{tx.quantity}</p>
            <div className="flex items-center border border-white/20">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 text-white hover:bg-white/10 transition"
              >−</button>
              <span className="w-10 text-center text-white text-sm">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 text-white hover:bg-white/10 transition"
              >+</button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            disabled={!selectedSize}
            className={`flex items-center justify-center gap-2 py-4 font-bold tracking-widest text-sm transition-all duration-300 ${
              added
                ? "bg-green-600 text-white"
                : selectedSize
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-zinc-800 text-gray-600 cursor-not-allowed"
            }`}
          >
            {added ? (
              <><Check size={18} /> {lang === "mn" ? "Нэмэгдлээ!" : "Added!"}</>
            ) : (
              <><ShoppingBag size={18} /> {tx.addToCart}</>
            )}
          </button>

          <p className="text-green-500 text-xs">✓ {tx.inStock} ({product.stock})</p>
        </div>
      </div>
    </div>
  );
}
