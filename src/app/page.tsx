import { db } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "asc" } });
  return <HomeClient products={products} />;
}
