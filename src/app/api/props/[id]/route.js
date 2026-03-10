import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";

export async function GET(req, { params }) {
  const orgId = getOrgId();
  const { id } = await params;

  try {
    const prop = await prisma.prop.findFirst({
      where: { id, orgId },
      include: {
        currentContainer: { include: { warehouse: true } },
        issues: {
          orderBy: { issuedAt: "desc" },
          include: { actor: true, issuedBy: true, returnedBy: true },
        },
        writeOff: true,
      },
    });

    if (!prop) return fail("prop not found", 404);
    return ok({ prop });
  } catch {
    return fail("failed to fetch prop", 500);
  }
}