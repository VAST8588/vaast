import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = `
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

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
);

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
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "Order" ("id"),
  FOREIGN KEY ("productId") REFERENCES "Product" ("id")
);
`;

for (const statement of sql.split(";").map(s => s.trim()).filter(Boolean)) {
  await client.execute(statement);
  console.log("✓", statement.slice(0, 50));
}

console.log("\n✅ Turso database бэлэн боллоо!");
