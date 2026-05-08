import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Нэвтэрнэ үү" }, { status: 401 });

  const orders = await db.order.findMany({
    where: { userId: (session.user as any).id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Нэвтэрнэ үү" }, { status: 401 });

  try {
    const { items, paymentMethod, note, totalAmount } = await req.json();

    const order = await db.order.create({
      data: {
        userId: (session.user as any).id,
        paymentMethod,
        totalAmount,
        note,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Имэйл илгээх
    try {
      await sendOrderConfirmation({
        to: session.user.email!,
        userName: session.user.name!,
        orderId: order.id,
        items: order.items.map((item: any) => ({
          name: item.product.nameMn,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount,
        paymentMethod,
      });
    } catch {}

    // Telegram мэдэгдэл
    try {
      const orderNum = order.id.slice(-8).toUpperCase();
      const itemsList = order.items.map((item: any) =>
        `• ${item.product.nameMn} (${item.size}) x${item.quantity} — ₮${(item.price * item.quantity).toLocaleString()}`
      ).join("\n");
      const text = `🛍 Шинэ захиалга!\n\n#${orderNum}\n👤 ${session.user.name} (${session.user.email})\n\n${itemsList}\n\n💰 Нийт: ₮${totalAmount.toLocaleString()}\n💳 ${paymentMethod === "qpay" ? "QPay" : "Банк шилжүүлэг"}`;
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
      });
    } catch {}

    return NextResponse.json({ success: true, orderId: order.id });
  } catch {
    return NextResponse.json({ error: "Захиалга хийхэд алдаа гарлаа" }, { status: 500 });
  }
}
