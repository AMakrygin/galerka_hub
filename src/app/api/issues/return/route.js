import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";

export async function POST(req) {
  const orgId = getOrgId();
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const { propId, containerId } = body;

  if (!propId || !containerId) {
    return fail("propId and containerId required", 400);
  }

  const openIssue = await prisma.issue.findFirst({
    where: { orgId, propId, status: "OPEN" },
  });

  if (!openIssue) {
    return fail("no open issue found", 400);
  }

  const container = await prisma.container.findFirst({
    where: { id: containerId, orgId },
    select: { id: true },
  });
  if (!container) return fail("container not found", 404);

  const result = await prisma.$transaction(async (tx) => {
    await tx.issue.update({
      where: { id: openIssue.id },
      data: {
        status: "CLOSED",
        returnedAt: new Date(),
      },
    });

    await tx.prop.update({
      where: { id: propId },
      data: {
        status: "IN_STORAGE",
        currentContainerId: containerId,
      },
    });

    return true;
  });

  return ok({ returned: result });
}