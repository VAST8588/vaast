import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductClient from "@/components/ProductClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();
  return <ProductClient product={product} />;
}
