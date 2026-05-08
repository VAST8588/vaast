import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET /api/seed — Vercel-д deploy хийсний дараа нэг удаа ажиллуулна
export async function GET() {
  try {
    // Хүснэгтүүд байгаа эсэхийг шалгах (Turso-д шинэ бол үүсгэнэ)
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "isVerified" INTEGER NOT NULL DEFAULT 0,
          "isAdmin" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);
      // resetToken columns нэмэх (байхгүй бол)
      try { await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "resetToken" TEXT`); } catch {}
      try { await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" DATETIME`); } catch {}
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "nameEn" TEXT NOT NULL,
          "nameMn" TEXT NOT NULL,
          "descEn" TEXT NOT NULL,
          "descMn" TEXT NOT NULL,
          "price" INTEGER NOT NULL,
          "images" TEXT NOT NULL,
          "sizes" TEXT NOT NULL,
          "stock" INTEGER NOT NULL DEFAULT 100,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "paymentMethod" TEXT NOT NULL,
          "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
          "totalAmount" INTEGER NOT NULL,
          "note" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User" ("id")
        )
      `);
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "OrderItem" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderId" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "size" TEXT NOT NULL,
          "quantity" INTEGER NOT NULL,
          "price" INTEGER NOT NULL,
          FOREIGN KEY ("orderId") REFERENCES "Order" ("id"),
          FOREIGN KEY ("productId") REFERENCES "Product" ("id")
        )
      `);
    } catch {
      // Хүснэгтүүд аль хэдийн байгаа бол алдааг үл тоо
    }

    // Admin үүсгэх/шинэчлэх
    const adminEmail = process.env.ADMIN_EMAIL || "vast@admin.mn";
    const adminPassword = process.env.ADMIN_PASSWORD || "Ochko123";
    const hashed = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
    if (existingAdmin) {
      await db.user.update({
        where: { email: adminEmail },
        data: { password: hashed, isAdmin: true, isVerified: true },
      });
    } else {
      await db.user.create({
        data: {
          name: "Admin",
          email: adminEmail,
          password: hashed,
          phone: "99999999",
          address: "Улаанбаатар",
          isAdmin: true,
          isVerified: true,
        },
      });
    }

    // Бүтээгдэхүүн байхгүй бол үүсгэх
    const count = await db.product.count();
    if (count === 0) {
      await db.product.createMany({
        data: [
          {
            nameEn: "VAST Silent Move Hoodie",
            nameMn: "VAST Silent Move Худи",
            descEn: "Premium heavyweight hoodie. Built Different. Oversized fit with graffiti artwork. No limits. Just possibilities.",
            descMn: "Өндөр чанарын хүнд жинтэй худи. Өөрөөр бүтээгдсэн. Гэрфитти урлагтай oversized тохируулга. Хязгаар байхгүй. Зөвхөн боломжууд.",
            price: 89000,
            images: "/products/hoodie1.png,/products/hoodie2.png",
            sizes: "XS,S,M,L,XL,2XL",
            stock: 50,
          },
          {
            nameEn: "VAST Silent Move Pants",
            nameMn: "VAST Silent Move Өмд",
            descEn: "Wide-leg premium sweatpants. VAST Built Different logo on left leg. Comfortable elastic waistband with drawstring.",
            descMn: "Өргөн хөлтэй premium sweatpants. VAST Built Different лого зүүн хөл дээр. Тохилог уян бүстэй drawstring-тэй.",
            price: 69000,
            images: "/products/pants1.png,/products/pants2.png",
            sizes: "XS,S,M,L,XL,2XL",
            stock: 50,
          },
        ],
      });
    }

    return NextResponse.json({ success: true, admin: adminEmail });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
