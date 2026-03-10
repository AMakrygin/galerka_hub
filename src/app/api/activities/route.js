import { prisma } from "@/lib/prisma";
import { getOrgId, ok } from "@/lib/api";
import { mapActivity } from "@/lib/contracts";

export async function GET(req) {
  const orgId = getOrgId();
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 50);

  const activities = await prisma.auditLog.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
    include: {
      actor: true,
    },
  });

  return ok({ activities: activities.map(mapActivity) });
}
