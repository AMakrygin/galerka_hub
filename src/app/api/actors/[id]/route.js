import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";

export async function GET(req, { params }) {
  const orgId = getOrgId();
  const { id } = await params;

  try {
    const actor = await prisma.user.findFirst({
      where: { id, orgId, role: "ACTOR" },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!actor) {
      return fail("actor not found", 404);
    }

    const openIssues = await prisma.issue.findMany({
      where: { orgId, actorUserId: id, status: "OPEN" },
      orderBy: { issuedAt: "desc" },
      include: {
        prop: {
          include: {
            currentContainer: { include: { warehouse: true } },
          },
        },
        issuedBy: { select: { id: true, name: true, email: true } },
      },
    });

    const history = await prisma.issue.findMany({
      where: { orgId, actorUserId: id },
      orderBy: { issuedAt: "desc" },
      take: 50,
      include: {
        prop: true,
        issuedBy: { select: { id: true, name: true, email: true } },
        returnedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return ok({ actor, openIssues, history });
  } catch {
    return fail("failed to fetch actor", 500);
  }
}