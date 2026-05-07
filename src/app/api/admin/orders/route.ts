import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 });

  const orders = await db.order.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true, address: true } },
      items: { include: { product: { select: { nameEn: true, nameMn: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Зөвшөөрөл байхгүй" }, { status: 403 });

  const { orderId, status, paymentStatus } = await req.json();

  const order = await db.order.update({
    where: { id: orderId },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
  });

  return NextResponse.json(order);
}
