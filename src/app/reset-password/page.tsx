"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "@/lib/store";

function ResetForm() {
  const { lang } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(lang === "mn" ? "Нууц үг таарахгүй байна" : "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError(lang === "mn" ? "Нууц үг хамгийн багадаа 6 тэмдэгт байна" : "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setError(data.error || (lang === "mn" ? "Алдаа гарлаа" : "Something went wrong"));
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="VAST" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-black tracking-widest text-white">
            {lang === "mn" ? "Нууц үг сэргээх" : "Reset Password"}
          </h1>
        </div>

        {done ? (
          <div className="bg-zinc-900 border border-white/10 p-6 text-center">
            <p className="text-green-400 font-semibold">
              {lang === "mn" ? "Нууц үг амжилттай солигдлоо!" : "Password changed successfully!"}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {lang === "mn" ? "Нэвтрэх хуудас руу шилжиж байна..." : "Redirecting to login..."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-xs tracking-wider block mb-2">
                {lang === "mn" ? "ШИНЭ НУУЦ ҮГ" : "NEW PASSWORD"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs tracking-wider block mb-2">
                {lang === "mn" ? "НУУЦ ҮГ ДАВТАХ" : "CONFIRM PASSWORD"}
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black py-3 font-bold tracking-widest text-sm hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading ? "..." : (lang === "mn" ? "ХАДГАЛАХ" : "SAVE")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
