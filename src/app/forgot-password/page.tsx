"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/lib/store";

export default function ForgotPasswordPage() {
  const { lang } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="VAST" width={48} height={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-black tracking-widest text-white">
            {lang === "mn" ? "Нууц үг мартсан" : "Forgot Password"}
          </h1>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-zinc-900 border border-white/10 p-6 mb-6">
              <p className="text-white font-semibold mb-2">
                {lang === "mn" ? "Имэйл илгээлээ!" : "Email sent!"}
              </p>
              <p className="text-gray-400 text-sm">
                {lang === "mn"
                  ? `${email} хаяг руу нууц үг сэргээх холбоос илгээлээ. Имэйлээ шалгана уу.`
                  : `We sent a reset link to ${email}. Please check your inbox.`}
              </p>
            </div>
            <Link href="/login" className="text-gray-500 text-sm hover:text-white transition">
              {lang === "mn" ? "Нэвтрэх хуудас руу буцах" : "Back to login"}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm text-center mb-6">
              {lang === "mn"
                ? "Бүртгэлтэй имэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээнэ."
                : "Enter your email and we'll send you a reset link."}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-xs tracking-wider block mb-2">
                  {lang === "mn" ? "И-МЭЙЛ" : "EMAIL"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                  placeholder="vast@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-black py-3 font-bold tracking-widest text-sm hover:bg-gray-200 transition disabled:opacity-50"
              >
                {loading ? "..." : (lang === "mn" ? "ИЛГЭЭХ" : "SEND LINK")}
              </button>
            </form>
            <p className="text-center mt-6">
              <Link href="/login" className="text-gray-500 text-sm hover:text-white transition">
                {lang === "mn" ? "Буцах" : "Back to login"}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
