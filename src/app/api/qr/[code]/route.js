import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";

export async function GET(req, { params }) {
  const orgId = getOrgId();
  const { code } = await params;

  try {
    const container = await prisma.container.findFirst({
      where: { orgId, qrCode: code },
      include: {
        warehouse: true,
        props: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!container) {
      return fail("container not found", 404);
    }

    return ok({ container });
  } catch {
    return fail("failed to fetch container by qr", 500);
  }
}