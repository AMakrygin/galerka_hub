const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

require("dotenv").config();

async function main() {
  // Prisma v7 + adapter
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const orgId = "org_demo";

  const org = await prisma.org.upsert({
    where: { id: orgId },
    update: {},
    create: { id: orgId, name: "Galёrka Hub (demo)" },
  });

  const admin = await prisma.user.upsert({
    where: { orgId_email: { orgId: org.id, email: "admin@demo.local" } },
    update: {},
    create: { orgId: org.id, email: "admin@demo.local", name: "Режиссёр", role: "ADMIN" },
  });

  const costumer = await prisma.user.upsert({
    where: { orgId_email: { orgId: org.id, email: "costumer@demo.local" } },
    update: {},
    create: { orgId: org.id, email: "costumer@demo.local", name: "Костюмер", role: "COSTUMER" },
  });

  const actor = await prisma.user.upsert({
    where: { orgId_email: { orgId: org.id, email: "actor@demo.local" } },
    update: {},
    create: { orgId: org.id, email: "actor@demo.local", name: "Актёр", role: "ACTOR" },
  });

  const wh = await prisma.warehouse.create({
    data: {
      orgId: org.id,
      name: "Склад №1",
      address: "Адрес (demo)",
      comment: "Комментарий к складу",
    },
  });

  const container = await prisma.container.create({
    data: {
      orgId: org.id,
      warehouseId: wh.id,
      name: "Стеллаж A / Полка 1",
      qrCode: "A-01",
      comment: "У двери",
    },
  });

  const prop = await prisma.prop.create({
    data: {
      orgId: org.id,
      name: "Шпага реквизитная",
      description: "Лёгкая (demo)",
      status: "IN_STORAGE",
      currentContainerId: container.id,
      createdByUserId: admin.id,
    },
  });

  console.log("Seed done:");
  console.log({
    orgId: org.id,
    adminEmail: admin.email,
    costumerEmail: costumer.email,
    actorEmail: actor.email,
    warehouseId: wh.id,
    containerQr: container.qrCode,
    propId: prop.id,
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});