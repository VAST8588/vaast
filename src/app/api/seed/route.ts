import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// GET /api/seed — admin болон бүтээгдэхүүн үүсгэх/шинэчлэх
export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "vast@admin.mn";
    const adminPassword = process.env.ADMIN_PASSWORD || "Ochko123";
    const hashed = await bcrypt.hash(adminPassword, 10);

    // Бүх admin-г устгаад шинэчлэх
    await db.user.deleteMany({ where: { isAdmin: true } });
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

    // Бүтээгдэхүүн байхгүй бол үүсгэх
    const products = await db.product.count();
    if (products === 0) {
      await db.product.createMany({
        data: [
          {
            nameEn: "VAST Silent Move Hoodie",
            nameMn: "VAST Silent Move Худи",
            descEn:
              "Premium heavyweight hoodie. Built Different. Oversized fit with graffiti artwork. No limits. Just possibilities.",
            descMn:
              "Өндөр чанарын хүнд жинтэй худи. Өөрөөр бүтээгдсэн. Гэрфитти урлагтай oversized тохируулга. Хязгаар байхгүй. Зөвхөн боломжууд.",
            price: 89000,
            images: "/products/hoodie1.jpg,/products/hoodie2.jpg,/products/hoodie3.jpg",
            sizes: "XS,S,M,L,XL,2XL",
            stock: 50,
          },
          {
            nameEn: "VAST Silent Move Pants",
            nameMn: "VAST Silent Move Өмд",
            descEn:
              "Wide-leg premium sweatpants. VAST Built Different logo on left leg. Comfortable elastic waistband with drawstring.",
            descMn:
              "Өргөн хөлтэй premium sweatpants. VAST Built Different лого зүүн хөл дээр. Тохилог уян бүстэй drawstring-тэй.",
            price: 69000,
            images: "/products/pants1.jpg,/products/pants2.jpg",
            sizes: "XS,S,M,L,XL,2XL",
            stock: 50,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Амжилттай",
      admin: adminEmail,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
