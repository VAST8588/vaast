"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { t } from "@/lib/translations";

export default function LoginPage() {
  const { lang } = useStore();
  const tx = t[lang];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError(lang === "mn" ? "И-мэйл эсвэл нууц үг буруу байна" : "Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="VAST" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-black tracking-widest text-white">{tx.loginTitle}</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs tracking-wider block mb-2">{tx.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-white/40 transition"
              placeholder="vast@example.com"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs tracking-wider block mb-2">{tx.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-white/40 transition"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black py-3 font-bold tracking-widest text-sm hover:bg-gray-200 transition mt-2 disabled:opacity-50"
          >
            {loading ? "..." : tx.loginTitle}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          {tx.noAccount}{" "}
          <Link href="/register" className="text-white hover:underline">
            {tx.registerHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
