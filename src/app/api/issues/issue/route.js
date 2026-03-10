import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";

export async function POST(req) {
  const orgId = getOrgId();

  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const { propId, actorUserId, comment } = body;

  if (!propId || !actorUserId) {
    return fail("propId and actorUserId required", 400);
  }

  const prop = await prisma.prop.findFirst({ where: { id: propId, orgId } });
  if (!prop) return fail("prop not found", 404);
  if (prop.status === "WRITTEN_OFF") return fail("prop written off", 400);

  const open = await prisma.issue.findFirst({
    where: { orgId, propId, status: "OPEN" },
  });
  if (open) return fail("already issued", 400);

  const issuedBy = await prisma.user.findFirst({
    where: { orgId, email: "admin@demo.local" },
    select: { id: true },
  });
  if (!issuedBy) return fail("issuedBy user not found", 500);

  const issue = await prisma.$transaction(async (tx) => {
    const created = await tx.issue.create({
      data: {
        orgId,
        propId,
        actorUserId,
        issuedByUserId: issuedBy.id,
        status: "OPEN",
        comment: comment || null,
      },
    });

    await tx.prop.update({
      where: { id: propId },
      data: { status: "ISSUED", currentContainerId: null },
    });

    await tx.auditLog.create({
      data: {
        orgId,
        actorUserId: issuedBy.id,
        action: "ISSUED",
        entityType: "PROP",
        entityId: propId,
        meta: { issueId: created.id, actorUserId },
      },
    });

    return created;
  });

  return ok({ issue }, 201);
}