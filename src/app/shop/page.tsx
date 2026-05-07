import { db } from "@/lib/db";
import ShopClient from "@/components/ShopClient";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "asc" } });
  return <ShopClient products={products} />;
}
