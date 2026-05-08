"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
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

        {/* Google товч */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-white/10 text-white py-3 text-sm font-medium hover:bg-zinc-800 transition mb-4 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.7 16.3 40 24 40v4z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          {googleLoading ? "..." : (lang === "mn" ? "Google-ээр бүртгүүлэх" : "Sign up with Google")}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-600 text-xs">{lang === "mn" ? "эсвэл" : "or"}</span>
          <div className="flex-1 h-px bg-white/10" />
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
