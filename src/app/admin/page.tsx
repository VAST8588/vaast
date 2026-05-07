"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import { Users, ShoppingBag, TrendingUp, Clock } from "lucide-react";

const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid"];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { lang } = useStore();
  const tx = t[lang];
  const router = useRouter();

  const [tab, setTab] = useState<"orders" | "users">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && !(session?.user as any)?.isAdmin) router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if ((session?.user as any)?.isAdmin) {
      Promise.all([
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/users").then((r) => r.json()),
      ]).then(([o, u]) => {
        setOrders(Array.isArray(o) ? o : []);
        setUsers(Array.isArray(u) ? u : []);
        setLoading(false);
      });
    }
  }, [session]);

  async function updateOrder(orderId: string, field: "status" | "paymentStatus", value: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, [field]: value }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, [field]: value } : o))
    );
  }

  async function toggleVerify(userId: string, current: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isVerified: !current }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerified: !current } : u))
    );
  }

  if (status === "loading" || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-500">...</div>;
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-widest text-white">{tx.adminPanel}</h1>
        <span className="text-xs text-gray-500 bg-zinc-900 px-3 py-1 border border-white/10">
          {session?.user?.name}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: tx.totalOrders, value: orders.length, color: "text-blue-400" },
          { icon: Users, label: tx.totalUsers, value: users.length, color: "text-purple-400" },
          { icon: TrendingUp, label: tx.totalRevenue, value: `₮${totalRevenue.toLocaleString()}`, color: "text-green-400" },
          { icon: Clock, label: tx.pending, value: pendingOrders, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-white/5 p-5">
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-gray-500 text-xs tracking-wider">{s.label}</p>
            <p className="text-white text-xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {(["orders", "users"] as const).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={`px-6 py-3 text-sm font-semibold tracking-wider transition border-b-2 ${
              tab === t_
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            {t_ === "orders" ? tx.orders : tx.users}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-zinc-900 border border-white/5 p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Customer info */}
                <div>
                  <p className="text-white font-semibold text-sm">{order.user.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{order.user.email}</p>
                  <p className="text-gray-500 text-xs">{order.user.phone}</p>
                  <p className="text-gray-600 text-xs mt-1">{order.user.address}</p>
                  <p className="text-gray-600 text-xs mt-2 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-600 text-xs">
                    {new Date(order.createdAt).toLocaleString("mn-MN")}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-gray-500 text-xs tracking-wider mb-2">{tx.orders}</p>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="text-sm text-gray-300 flex justify-between">
                      <span>{item.product.nameMn} ({item.size}) ×{item.quantity}</span>
                      <span className="text-white">₮{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="text-white font-bold text-sm mt-2 pt-2 border-t border-white/10 flex justify-between">
                    <span>{tx.total}</span>
                    <span>₮{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    {order.paymentMethod === "qpay" ? "QPay" : tx.bankTransfer}
                  </p>
                </div>

                {/* Status controls */}
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-gray-500 text-xs tracking-wider mb-2">{tx.updateStatus}</p>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrder(order.id, "status", e.target.value)}
                      className="w-full bg-zinc-800 border border-white/10 text-white text-sm px-3 py-2 outline-none"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{tx[s as keyof typeof tx] || s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs tracking-wider mb-2">{tx.paymentMethod}</p>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => updateOrder(order.id, "paymentStatus", e.target.value)}
                      className="w-full bg-zinc-800 border border-white/10 text-white text-sm px-3 py-2 outline-none"
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>{tx[s as keyof typeof tx] || s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-16">
              {lang === "mn" ? "Захиалга байхгүй" : "No orders yet"}
            </p>
          )}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.id} className="bg-zinc-900 border border-white/5 p-5 flex items-center justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-400">{user.phone}</p>
                  <p className="text-gray-600 text-xs">{user.address}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">
                    {tx.totalOrders}: <span className="text-white">{user._count.orders}</span>
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(user.createdAt).toLocaleDateString("mn-MN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {user.isAdmin && (
                    <span className="text-yellow-400 text-xs border border-yellow-400/30 px-2 py-0.5">
                      Admin
                    </span>
                  )}
                  <span className={`text-xs border px-2 py-0.5 ${
                    user.isVerified
                      ? "text-green-400 border-green-400/30"
                      : "text-gray-500 border-gray-500/30"
                  }`}>
                    {user.isVerified
                      ? (lang === "mn" ? "Баталгаажсан" : "Verified")
                      : (lang === "mn" ? "Хүлээгдэж байна" : "Pending")}
                  </span>
                </div>
              </div>
              {!user.isAdmin && (
                <button
                  onClick={() => toggleVerify(user.id, user.isVerified)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-semibold tracking-wider border transition ${
                    user.isVerified
                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  {user.isVerified
                    ? (lang === "mn" ? "Цуцлах" : "Unverify")
                    : tx.verify}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
