import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";
import { mapActor, mapAssignment } from "@/lib/contracts";

export async function GET(req, { params }) {
  const orgId = getOrgId();
  const { id } = await params;

  try {
    const actor = await prisma.user.findFirst({
      where: { id, orgId, role: "ACTOR" },
      include: {
        _count: {
          select: {
            actorIssues: {
              where: { status: "OPEN" },
            },
          },
        },
      },
    });

    if (!actor) {
      return fail("actor not found", 404);
    }

    const openIssues = await prisma.issue.findMany({
      where: { orgId, actorUserId: id, status: "OPEN" },
      orderBy: { issuedAt: "desc" },
      include: {
        prop: true,
        actor: true,
      },
    });

    const history = await prisma.issue.findMany({
      where: { orgId, actorUserId: id },
      orderBy: { issuedAt: "desc" },
      take: 50,
      include: {
        prop: true,
        actor: true,
      },
    });

    return ok({
      actor: mapActor(actor),
      openAssignments: openIssues.map(mapAssignment),
      history: history.map(mapAssignment),
    });
  } catch {
    return fail("failed to fetch actor", 500);
  }
}