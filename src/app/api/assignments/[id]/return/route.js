import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";
import { mapAssignment } from "@/lib/contracts";
import { getSystemUser } from "@/lib/services/context";
import { logActivity } from "@/lib/services/activity";

export async function POST(req, { params }) {
  const orgId = getOrgId(req);
  const { id } = await params;
  const body = await parseJsonSafe(req);

  const containerId = (body?.containerId || "").trim();
  if (!containerId) return fail("containerId required", 400);

  const assignment = await prisma.issue.findFirst({
    where: { id, orgId },
    include: { prop: true, actor: true },
  });

  if (!assignment) return fail("assignment not found", 404);
  if (assignment.status === "CLOSED") return fail("assignment already returned", 400);

  const container = await prisma.container.findFirst({ where: { id: containerId, orgId }, select: { id: true } });
  if (!container) return fail("container not found", 404);

  const systemUser = await getSystemUser(orgId);

  const updated = await prisma.$transaction(async (tx) => {
    const closed = await tx.issue.update({
      where: { id },
      data: {
        status: "CLOSED",
        returnedAt: new Date(),
        returnedByUserId: systemUser.id,
      },
      include: {
        prop: true,
        actor: true,
      },
    });

    await tx.prop.update({
      where: { id: closed.propId },
      data: {
        status: "IN_STORAGE",
        currentContainerId: containerId,
      },
    });

    await logActivity(tx, {
      orgId,
      actorUserId: systemUser.id,
      action: "PROP_RETURNED",
      entityType: "ASSIGNMENT",
      entityId: closed.id,
      meta: {
        type: "prop_returned",
        description: `${closed.prop.name} возвращён от ${closed.actor.name}`,
      },
    });

    return closed;
  });

  return ok({ assignment: mapAssignment(updated) });
}
