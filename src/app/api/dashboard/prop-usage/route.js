import { prisma } from "@/lib/prisma";
import { getOrgId, ok } from "@/lib/api";

export async function GET(req) {
  const orgId = getOrgId(req);

  const rows = await prisma.issue.groupBy({
    by: ["performance"],
    where: {
      orgId,
      performance: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
  });

  return ok({
    data: rows.map((item) => ({
      name: item.performance,
      props: item._count._all,
    })),
  });
}
