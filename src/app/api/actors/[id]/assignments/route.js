import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";
import { mapAssignment } from "@/lib/contracts";

export async function GET(_req, { params }) {
  const orgId = getOrgId(_req);
  const { id } = await params;

  const actor = await prisma.user.findFirst({ where: { id, orgId, role: "ACTOR" }, select: { id: true } });
  if (!actor) return fail("actor not found", 404);

  const assignments = await prisma.issue.findMany({
    where: { orgId, actorUserId: id },
    orderBy: { issuedAt: "desc" },
    include: {
      prop: true,
      actor: true,
    },
  });

  return ok({ assignments: assignments.map(mapAssignment) });
}
