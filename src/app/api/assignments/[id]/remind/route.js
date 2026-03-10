import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";
import { getSystemUser } from "@/lib/services/context";
import { logActivity } from "@/lib/services/activity";

export async function POST(_req, { params }) {
  const orgId = getOrgId(_req);
  const { id } = await params;

  const assignment = await prisma.issue.findFirst({
    where: { id, orgId },
    include: { prop: true, actor: true },
  });

  if (!assignment) return fail("assignment not found", 404);
  if (assignment.status === "CLOSED") return fail("assignment already closed", 400);

  const systemUser = await getSystemUser(orgId);

  await prisma.$transaction(async (tx) => {
    await tx.issue.update({
      where: { id },
      data: { remindedAt: new Date() },
    });

    await logActivity(tx, {
      orgId,
      actorUserId: systemUser.id,
      action: "ASSIGNMENT_REMINDER",
      entityType: "ASSIGNMENT",
      entityId: id,
      meta: {
        type: "actor_assigned",
        description: `Отправлено напоминание по возврату: ${assignment.prop.name} (${assignment.actor.name})`,
      },
    });
  });

  return ok({ reminded: true });
}
