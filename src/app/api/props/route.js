import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";

export async function GET(req) {
  const orgId = getOrgId();

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = (url.searchParams.get("status") || "").trim();

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
        issues: {
          where: { status: "OPEN" },
          orderBy: { issuedAt: "desc" },
          take: 1,
          include: { actor: true },
        },
      },
    });

    return ok({ props });
  } catch {
    return fail("failed to fetch props", 500);
  }
}