import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) return null;
  return session;
}

// Бүх бараа авах
export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 });

  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

// Шинэ бараа нэмэх
export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 });

  const { nameEn, nameMn, descEn, descMn, price, images, sizes, stock } = await req.json();

  if (!nameEn || !nameMn || !price || !images) {
    return NextResponse.json({ error: "Шаардлагатай талбарыг бөглөнө үү" }, { status: 400 });
  }

  const product = await db.product.create({
    data: { nameEn, nameMn, descEn, descMn, price: Number(price), images, sizes, stock: Number(stock) },
  });

  return NextResponse.json({ success: true, product });
}

// Үнэ / Stock засах
export async function PATCH(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 });

  const { productId, price, stock } = await req.json();

  const product = await db.product.update({
    where: { id: productId },
    data: {
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
    },
  });

  return NextResponse.json({ success: true, product });
}

// Бараа устгах
export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 });

  const { productId } = await req.json();
  await db.product.delete({ where: { id: productId } });
  return NextResponse.json({ success: true });
}
