"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";

export default function RegisterPage() {
  const { lang } = useStore();
  const tx = t[lang];
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
    } else {
      router.push("/login");
    }
  }

  const fields = [
    { key: "name", label: tx.name, type: "text", placeholder: lang === "mn" ? "Бат-Эрдэнэ" : "John Doe" },
    { key: "email", label: tx.email, type: "email", placeholder: "vast@example.com" },
    { key: "password", label: tx.password, type: "password", placeholder: "••••••••" },
    { key: "phone", label: tx.phone, type: "tel", placeholder: "9999 9999" },
    { key: "address", label: tx.address, type: "text", placeholder: lang === "mn" ? "СБД, 1-р хороо, ..." : "Ulaanbaatar, ..." },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="VAST" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-black tracking-widest text-white">{tx.registerTitle}</h1>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-gray-400 text-xs tracking-wider block mb-2">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => update(f.key, e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black py-3 font-bold tracking-widest text-sm hover:bg-gray-200 transition mt-2 disabled:opacity-50"
          >
            {loading ? "..." : tx.registerTitle}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          {tx.hasAccount}{" "}
          <Link href="/login" className="text-white hover:underline">
            {tx.loginHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
