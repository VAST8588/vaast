"use client";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";

type Props = {
  id: string;
  nameEn: string;
  nameMn: string;
  price: number;
  images: string;
};

export default function ProductCard({ id, nameEn, nameMn, price, images }: Props) {
  const { lang } = useStore();
  const tx = t[lang];
  const image = images.split(",")[0];

  return (
    <Link href={`/product/${id}`} className="group block">
      <div className="bg-zinc-900 border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-zinc-800">
          <Image
            src={image}
            alt={lang === "mn" ? nameMn : nameEn}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm tracking-wider">
            {lang === "mn" ? nameMn : nameEn}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            ₮{price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
