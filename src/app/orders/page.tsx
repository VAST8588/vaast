"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  confirmed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  delivered: "text-green-400 border-green-400/30 bg-green-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const { lang } = useStore();
  const tx = t[lang];
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/orders").then((r) => r.json()).then(setOrders);
    }
  }, [session]);

  if (status === "loading") {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black tracking-widest text-white mb-10">{tx.myOrders}</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-20">
          {lang === "mn" ? "Захиалга байхгүй байна" : "No orders yet"}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-zinc-900 border border-white/5 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-xs font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString(lang === "mn" ? "mn-MN" : "en-US")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 border rounded ${STATUS_COLORS[order.status] || "text-gray-400"}`}>
                    {tx[order.status as keyof typeof tx] || order.status}
                  </span>
                  <span className={`text-xs px-2 py-1 border rounded ${
                    order.paymentStatus === "paid"
                      ? "text-green-400 border-green-400/30 bg-green-400/10"
                      : "text-red-400 border-red-400/30 bg-red-400/10"
                  }`}>
                    {order.paymentStatus === "paid" ? tx.paid : tx.unpaid}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {lang === "mn" ? item.product.nameMn : item.product.nameEn}
                      <span className="text-gray-500 ml-2">({item.size}) × {item.quantity}</span>
                    </span>
                    <span className="text-white">₮{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-white font-bold border-t border-white/10 pt-4">
                <span>{tx.total}</span>
                <span>₮{order.totalAmount.toLocaleString()}</span>
              </div>

              <p className="text-gray-600 text-xs mt-2">
                {order.paymentMethod === "qpay" ? "QPay" : tx.bankTransfer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
