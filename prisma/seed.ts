import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password,
      role: "admin",
    },
  });

  const free = await db.productType.upsert({
    where: { name: "Free" },
    update: {},
    create: { name: "Free", description: "Free tier with basic access" },
  });

  const pro = await db.productType.upsert({
    where: { name: "Pro" },
    update: {},
    create: { name: "Pro", description: "Pro tier with full access" },
  });

  await db.productFeature.upsert({
    where: { key: "basic_access" },
    update: {},
    create: { productTypeId: free.id, name: "Basic Access", key: "basic_access", isEnabled: true },
  });

  await db.productFeature.upsert({
    where: { key: "api_access" },
    update: {},
    create: { productTypeId: pro.id, name: "API Access", key: "api_access", isEnabled: true },
  });

  await db.productFeature.upsert({
    where: { key: "export_csv" },
    update: {},
    create: { productTypeId: pro.id, name: "Export CSV", key: "export_csv", isEnabled: true },
  });

  await db.productFeature.upsert({
    where: { key: "priority_support" },
    update: {},
    create: { productTypeId: pro.id, name: "Priority Support", key: "priority_support", isEnabled: true },
  });

  console.log("Seeded:", { admin: admin.email, productTypes: ["Free", "Pro"] });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
