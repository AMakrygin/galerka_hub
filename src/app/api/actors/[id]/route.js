import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const orgId = "org_demo";
  const { id } = await params; // Next 16: params = Promise

  const actor = await prisma.user.findFirst({
    where: { id, orgId, role: "ACTOR" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!actor) {
    return Response.json({ error: "Actor not found" }, { status: 404 });
  }

  // Что сейчас на руках: открытые выдачи
  const openIssues = await prisma.issue.findMany({
    where: { orgId, actorUserId: id, status: "OPEN" },
    orderBy: { issuedAt: "desc" },
    include: {
      prop: {
        include: {
          currentContainer: { include: { warehouse: true } }, // обычно null у ISSUED, но пусть будет
        },
      },
      issuedBy: { select: { id: true, name: true, email: true } },
    },
  });

  // История: последние 50 выдач/возвратов
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

  return Response.json({ actor, openIssues, history });
}