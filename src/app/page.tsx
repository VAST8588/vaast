import { db } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "asc" } });
  return <HomeClient products={products} />;
}
