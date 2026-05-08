import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Имэйл оруулна уу" }, { status: 400 });

  const user = await db.user.findUnique({ where: { email } });

  // Хэрэглэгч байхгүй ч амжилттай гэж хариулна (аюулгүй байдлын үүднээс)
  if (!user) return NextResponse.json({ success: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 цаг

  await db.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expires },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "VAST <onboarding@resend.dev>",
    to: email,
    subject: "VAST — Нууц үг сэргээх",
    html: `
    <div style="background:#0a0a0a;padding:40px 20px;font-family:sans-serif">
      <div style="max-width:480px;margin:0 auto">
        <h1 style="color:#fff;letter-spacing:0.2em;font-size:24px;margin:0 0 4px">VAST</h1>
        <p style="color:#555;font-size:12px;letter-spacing:0.2em;margin:0 0 32px">STREETWEAR</p>
        <h2 style="color:#fff;font-size:18px;margin:0 0 12px">Нууц үг сэргээх</h2>
        <p style="color:#aaa;margin:0 0 24px">Доорх товчийг дарж нууц үгээ сэргээнэ үү. Холбоос 1 цагийн дараа хүчингүй болно.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#fff;color:#000;padding:12px 32px;font-weight:bold;font-size:14px;text-decoration:none;letter-spacing:0.1em">НУУЦ ҮГ СЭРГЭЭХ</a>
        <p style="color:#555;font-size:12px;margin:24px 0 0">Хэрэв та энэ хүсэлт гаргаагүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
      </div>
    </div>`,
  });

  return NextResponse.json({ success: true });
}
