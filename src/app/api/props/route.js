import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const orgId = "org_demo";
  const url = new URL(req.url);

  const q = (url.searchParams.get("q") || "").trim();
  const status = (url.searchParams.get("status") || "").trim(); // IN_STORAGE | ISSUED | WRITTEN_OFF

  const props = await prisma.prop.findMany({
    where: {
      orgId,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { inventoryNumber: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      currentContainer: { include: { warehouse: true } },

      // ✅ кто держит сейчас: открытая выдача (если есть)
      issues: {
        where: { status: "OPEN" },
        orderBy: { issuedAt: "desc" },
        take: 1,
        include: { actor: true },
      },
    },
  });

  return Response.json({ props });
}