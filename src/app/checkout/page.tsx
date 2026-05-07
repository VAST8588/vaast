"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";
import Image from "next/image";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { lang, cart, cartTotal, clearCart } = useStore();
  const tx = t[lang];
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<"qpay" | "bank">("qpay");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = cartTotal();

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  if (cart.length === 0 && !success) {
    router.push("/cart");
    return null;
  }

  async function handleOrder() {
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((c) => ({
          productId: c.productId,
          size: c.size,
          quantity: c.quantity,
          price: c.price,
        })),
        paymentMethod,
        note,
        totalAmount: total,
      }),
    });

    setLoading(false);
    if (res.ok) {
      clearCart();
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-6">✓</div>
          <h1 className="text-2xl font-black text-white tracking-wider mb-3">{tx.orderSuccess}</h1>
          <p className="text-gray-400 mb-8">{tx.orderSuccessMsg}</p>
          <button
            onClick={() => router.push("/orders")}
            className="bg-white text-black px-8 py-3 font-bold tracking-wider text-sm hover:bg-gray-200 transition"
          >
            {tx.myOrders}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black tracking-widest text-white mb-10">{tx.checkoutTitle}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Order summary */}
        <div>
          <h2 className="text-white font-semibold tracking-wider text-sm mb-4">{tx.cartTitle}</h2>
          <div className="flex flex-col gap-3 mb-6">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-3 bg-zinc-900 p-3 border border-white/5">
                <div className="relative w-16 h-16 bg-zinc-800 flex-shrink-0">
                  <Image src={item.image} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-xs font-semibold">{lang === "mn" ? item.nameMn : item.nameEn}</p>
                  <p className="text-gray-500 text-xs">{tx.size}: {item.size} × {item.quantity}</p>
                  <p className="text-white text-sm font-bold mt-1">₮{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-white font-black text-lg border-t border-white/10 pt-4">
            <span>{tx.total}</span>
            <span>₮{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="flex flex-col gap-6">
          {/* Payment method */}
          <div>
            <h2 className="text-white font-semibold tracking-wider text-sm mb-4">{tx.paymentMethod}</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["qpay", "bank"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-4 border text-sm font-semibold tracking-wider transition ${
                    paymentMethod === method
                      ? "border-white bg-white text-black"
                      : "border-white/20 text-gray-400 hover:border-white hover:text-white"
                  }`}
                >
                  {method === "qpay" ? tx.qpay : tx.bankTransfer}
                </button>
              ))}
            </div>
          </div>

          {/* QPay info */}
          {paymentMethod === "qpay" && (
            <div className="bg-zinc-900 border border-white/10 p-6 rounded text-center">
              <p className="text-gray-400 text-sm mb-3">{lang === "mn" ? "QPay QR код" : "QPay QR Code"}</p>
              <div className="w-40 h-40 bg-white mx-auto flex items-center justify-center mb-3">
                <span className="text-black text-xs text-center px-2">
                  {lang === "mn"
                    ? "Захиалга өгсний дараа QPay QR код ирнэ"
                    : "QPay QR will appear after placing order"}
                </span>
              </div>
              <p className="text-gray-500 text-xs">
                {lang === "mn"
                  ? "Төлбөр хийсний дараа захиалга баталгаажна"
                  : "Order confirmed after payment"}
              </p>
            </div>
          )}

          {/* Bank transfer info */}
          {paymentMethod === "bank" && (
            <div className="bg-zinc-900 border border-white/10 p-6">
              <h3 className="text-white font-semibold text-sm mb-4">{tx.bankInfo}</h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{tx.bankName}</span>
                  <span className="text-white font-semibold">Хаан Банк</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{tx.accountNumber}</span>
                  <span className="text-white font-semibold font-mono">5000 1234 5678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{tx.accountName}</span>
                  <span className="text-white font-semibold">VAST LLC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{tx.total}</span>
                  <span className="text-white font-bold">₮{total.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-yellow-500 text-xs mt-4">
                {lang === "mn"
                  ? "⚠ Гүйлгээний утгад утасны дугаараа бичнэ үү"
                  : "⚠ Write your phone number in transfer description"}
              </p>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-white text-sm font-semibold tracking-wider block mb-2">{tx.orderNote}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 border border-white/10 text-white text-sm p-3 outline-none focus:border-white/30 transition resize-none placeholder:text-gray-600"
              placeholder={lang === "mn" ? "Тэмдэглэл..." : "Optional note..."}
            />
          </div>

          <button
            onClick={handleOrder}
            disabled={loading}
            className="bg-white text-black py-4 font-bold tracking-widest text-sm hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading
              ? (lang === "mn" ? "Илгээж байна..." : "Placing order...")
              : tx.placeOrder}
          </button>
        </div>
      </div>
    </div>
  );
}
