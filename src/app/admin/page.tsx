"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import { Users, ShoppingBag, TrendingUp, Clock, Plus, Trash2, Save, BarChart2 } from "lucide-react";

const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "paid"];
const DEFAULT_SIZES = "XS,S,M,L,XL,2XL";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { lang } = useStore();
  const tx = t[lang];
  const router = useRouter();

  const [tab, setTab] = useState<"orders" | "users" | "products" | "stats">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Шинэ бараа нэмэх form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nameEn: "", nameMn: "", descEn: "", descMn: "",
    price: "", images: "", sizes: DEFAULT_SIZES, stock: "50",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && !(session?.user as any)?.isAdmin) router.push("/");
  }, [status, session, router]);

  useEffect(() => {
    if ((session?.user as any)?.isAdmin) {
      Promise.all([
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/products").then((r) => r.json()),
      ]).then(([o, u, p]) => {
        setOrders(Array.isArray(o) ? o : []);
        setUsers(Array.isArray(u) ? u : []);
        setProducts(Array.isArray(p) ? p : []);
        setLoading(false);
      });
    }
  }, [session]);

  async function updateOrder(orderId: string, field: string, value: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, [field]: value }),
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, [field]: value } : o)));
  }

  async function toggleVerify(userId: string, current: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isVerified: !current }),
    });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isVerified: !current } : u)));
  }

  async function updateProduct(productId: string, field: "price" | "stock", value: string) {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, [field]: num }),
    });
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, [field]: num } : p)));
  }

  async function deleteProduct(productId: string) {
    if (!confirm(lang === "mn" ? "Устгах уу?" : "Delete this product?")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  async function addProduct() {
    if (!newProduct.nameEn || !newProduct.nameMn || !newProduct.price || !newProduct.images) {
      alert(lang === "mn" ? "Бүх талбарыг бөглөнө үү" : "Fill all required fields");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setProducts((prev) => [data.product, ...prev]);
      setNewProduct({ nameEn: "", nameMn: "", descEn: "", descMn: "", price: "", images: "", sizes: DEFAULT_SIZES, stock: "50" });
      setShowAddForm(false);
    }
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
        <span className="text-xs text-gray-500 bg-zinc-900 px-3 py-1 border border-white/10">{session?.user?.name}</span>
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
        {(["orders", "users", "products", "stats"] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-6 py-3 text-sm font-semibold tracking-wider transition border-b-2 ${
              tab === tb ? "border-white text-white" : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            {tb === "orders" ? tx.orders : tb === "users" ? tx.users : tb === "products" ? (lang === "mn" ? "Бараа" : "Products") : (lang === "mn" ? "Статистик" : "Stats")}
          </button>
        ))}
      </div>

      {/* ===== ORDERS TAB ===== */}
      {tab === "orders" && (
        <div className="flex flex-col gap-4">
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-16">{lang === "mn" ? "Захиалга байхгүй" : "No orders yet"}</p>
          )}
          {orders.map((order) => (
            <div key={order.id} className="bg-zinc-900 border border-white/5 p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-white font-semibold text-sm">{order.user.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{order.user.email}</p>
                  <p className="text-gray-500 text-xs">{order.user.phone}</p>
                  <p className="text-gray-600 text-xs mt-1">{order.user.address}</p>
                  <p className="text-gray-600 text-xs mt-2 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-600 text-xs">{new Date(order.createdAt).toLocaleString("mn-MN")}</p>
                </div>
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
                  <p className="text-gray-600 text-xs mt-1">{order.paymentMethod === "qpay" ? "QPay" : tx.bankTransfer}</p>
                </div>
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
        </div>
      )}

      {/* ===== USERS TAB ===== */}
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
                  <p className="text-gray-500 text-xs">{tx.totalOrders}: <span className="text-white">{user._count.orders}</span></p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(user.createdAt).toLocaleDateString("mn-MN")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.isAdmin && <span className="text-yellow-400 text-xs border border-yellow-400/30 px-2 py-0.5">Admin</span>}
                  <span className={`text-xs border px-2 py-0.5 ${user.isVerified ? "text-green-400 border-green-400/30" : "text-gray-500 border-gray-500/30"}`}>
                    {user.isVerified ? (lang === "mn" ? "Баталгаажсан" : "Verified") : (lang === "mn" ? "Хүлээгдэж байна" : "Pending")}
                  </span>
                </div>
              </div>
              {!user.isAdmin && (
                <button
                  onClick={() => toggleVerify(user.id, user.isVerified)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-semibold tracking-wider border transition ${
                    user.isVerified ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  }`}
                >
                  {user.isVerified ? (lang === "mn" ? "Цуцлах" : "Unverify") : tx.verify}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== PRODUCTS TAB ===== */}
      {tab === "products" && (
        <div>
          {/* Бараа нэмэх товч */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-sm font-bold tracking-wider hover:bg-gray-200 transition"
            >
              <Plus size={16} />
              {lang === "mn" ? "Бараа нэмэх" : "Add Product"}
            </button>
          </div>

          {/* Нэмэх form */}
          {showAddForm && (
            <div className="bg-zinc-900 border border-white/10 p-6 mb-6">
              <h2 className="text-white font-bold tracking-wider mb-5 text-sm">
                {lang === "mn" ? "Шинэ бараа нэмэх" : "Add New Product"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "nameMn", label: "Монгол нэр *", placeholder: "VAST Silent Move Худи" },
                  { key: "nameEn", label: "English Name *", placeholder: "VAST Silent Move Hoodie" },
                  { key: "descMn", label: "Монгол тайлбар", placeholder: "Тайлбар..." },
                  { key: "descEn", label: "English Description", placeholder: "Description..." },
                  { key: "price", label: "Үнэ (₮) *", placeholder: "89000", type: "number" },
                  { key: "stock", label: "Нөөц тоо *", placeholder: "50", type: "number" },
                  { key: "sizes", label: "Хэмжээнүүд", placeholder: "XS,S,M,L,XL,2XL" },
                  { key: "images", label: "Зургийн зам * (таслалаар тусгаарлана)", placeholder: "/products/new1.png,/products/new2.png" },
                ].map((f) => (
                  <div key={f.key} className={f.key === "images" || f.key === "descMn" || f.key === "descEn" ? "sm:col-span-2" : ""}>
                    <label className="text-gray-400 text-xs tracking-wider block mb-1.5">{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={newProduct[f.key as keyof typeof newProduct]}
                      onChange={(e) => setNewProduct((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-zinc-800 border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-white/30 transition placeholder:text-gray-600"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={addProduct}
                  disabled={saving}
                  className="flex items-center gap-2 bg-white text-black px-6 py-2.5 text-sm font-bold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  <Save size={15} />
                  {saving ? "..." : (lang === "mn" ? "Хадгалах" : "Save")}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 text-sm text-gray-400 border border-white/10 hover:text-white transition"
                >
                  {lang === "mn" ? "Болих" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Бараануудын жагсаалт */}
          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <div key={product.id} className="bg-zinc-900 border border-white/5 p-5">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  {/* Нэр */}
                  <div>
                    <p className="text-white font-semibold text-sm">{product.nameMn}</p>
                    <p className="text-gray-500 text-xs mt-1">{product.nameEn}</p>
                    <p className="text-gray-600 text-xs mt-1">{product.sizes}</p>
                  </div>

                  {/* Үнэ засах */}
                  <div>
                    <label className="text-gray-500 text-xs tracking-wider block mb-1.5">
                      {lang === "mn" ? "Үнэ (₮)" : "Price (₮)"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        defaultValue={product.price}
                        onBlur={(e) => {
                          if (Number(e.target.value) !== product.price) {
                            updateProduct(product.id, "price", e.target.value);
                          }
                        }}
                        className="w-full bg-zinc-800 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30 transition"
                      />
                    </div>
                  </div>

                  {/* Stock засах */}
                  <div>
                    <label className="text-gray-500 text-xs tracking-wider block mb-1.5">
                      {lang === "mn" ? "Нөөц" : "Stock"}
                    </label>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      onBlur={(e) => {
                        if (Number(e.target.value) !== product.stock) {
                          updateProduct(product.id, "stock", e.target.value);
                        }
                      }}
                      className="w-full bg-zinc-800 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-white/30 transition"
                    />
                  </div>

                  {/* Устгах */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex items-center gap-2 text-red-400 border border-red-400/30 px-4 py-2 text-xs hover:bg-red-400/10 transition"
                    >
                      <Trash2 size={14} />
                      {lang === "mn" ? "Устгах" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-gray-500 text-center py-16">
                {lang === "mn" ? "Бараа байхгүй" : "No products yet"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== STATS TAB ===== */}
      {tab === "stats" && (() => {
        // Өдрөөр бүлэглэх
        const byDay: Record<string, number> = {};
        const byMonth: Record<string, number> = {};
        const byProduct: Record<string, { name: string; qty: number; revenue: number }> = {};

        orders.forEach((o) => {
          const date = new Date(o.createdAt);
          const day = date.toLocaleDateString("mn-MN");
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          byDay[day] = (byDay[day] || 0) + o.totalAmount;
          byMonth[month] = (byMonth[month] || 0) + o.totalAmount;
          o.items?.forEach((item: any) => {
            if (!byProduct[item.productId]) byProduct[item.productId] = { name: item.product?.nameMn || item.productId, qty: 0, revenue: 0 };
            byProduct[item.productId].qty += item.quantity;
            byProduct[item.productId].revenue += item.price * item.quantity;
          });
        });

        const days = Object.entries(byDay).slice(-14).reverse();
        const months = Object.entries(byMonth).reverse();
        const topProducts = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue);
        const maxDay = Math.max(...days.map(([, v]) => v), 1);
        const maxMonth = Math.max(...months.map(([, v]) => v), 1);

        return (
          <div className="flex flex-col gap-8">
            {/* Сарын борлуулалт */}
            <div className="bg-zinc-900 border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 size={16} className="text-green-400" />
                <h2 className="text-white font-bold tracking-wider text-sm">{lang === "mn" ? "Сарын борлуулалт" : "Monthly Revenue"}</h2>
              </div>
              {months.length === 0 ? (
                <p className="text-gray-500 text-sm">{lang === "mn" ? "Мэдээлэл байхгүй" : "No data"}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {months.map(([month, amount]) => (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-20 shrink-0">{month}</span>
                      <div className="flex-1 bg-zinc-800 h-6 relative">
                        <div
                          className="h-full bg-green-500/70 transition-all"
                          style={{ width: `${(amount / maxMonth) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-xs font-bold w-28 text-right shrink-0">₮{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Өдрийн борлуулалт (сүүлийн 14 өдөр) */}
            <div className="bg-zinc-900 border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={16} className="text-blue-400" />
                <h2 className="text-white font-bold tracking-wider text-sm">{lang === "mn" ? "Өдрийн борлуулалт (сүүлийн 14 өдөр)" : "Daily Revenue (last 14 days)"}</h2>
              </div>
              {days.length === 0 ? (
                <p className="text-gray-500 text-sm">{lang === "mn" ? "Мэдээлэл байхгүй" : "No data"}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {days.map(([day, amount]) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs w-24 shrink-0">{day}</span>
                      <div className="flex-1 bg-zinc-800 h-6 relative">
                        <div
                          className="h-full bg-blue-500/70 transition-all"
                          style={{ width: `${(amount / maxDay) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-xs font-bold w-28 text-right shrink-0">₮{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Хамгийн их борлуулагдсан бараа */}
            <div className="bg-zinc-900 border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag size={16} className="text-yellow-400" />
                <h2 className="text-white font-bold tracking-wider text-sm">{lang === "mn" ? "Бараагаар борлуулалт" : "Revenue by Product"}</h2>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">{lang === "mn" ? "Мэдээлэл байхгүй" : "No data"}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {topProducts.map((p) => (
                    <div key={p.name} className="flex items-center justify-between gap-4 py-3 border-b border-white/5">
                      <p className="text-white text-sm font-semibold">{p.name}</p>
                      <div className="flex gap-6 text-xs text-right">
                        <span className="text-gray-400">{lang === "mn" ? "Тоо:" : "Qty:"} <span className="text-white font-bold">{p.qty}</span></span>
                        <span className="text-gray-400">{lang === "mn" ? "Орлого:" : "Revenue:"} <span className="text-green-400 font-bold">₮{p.revenue.toLocaleString()}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
