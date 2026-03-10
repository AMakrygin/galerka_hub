import { prisma } from "@/lib/prisma";
import { getOrgId, ok } from "@/lib/api";

export async function GET(req) {
  const orgId = getOrgId(req);

  const containers = await prisma.container.findMany({
    where: { orgId, capacity: { not: null } },
    include: {
      _count: { select: { props: true } },
    },
    orderBy: { name: "asc" },
  });

  return ok({
    data: containers.map((container) => ({
      name: container.name,
      used: container._count.props,
      capacity: container.capacity || 0,
    })),
  });
}
