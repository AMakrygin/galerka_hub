import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const orgId = "org_demo";

  const body = await req.json();
  const { propId, actorUserId, comment } = body;

  if (!propId || !actorUserId) {
    return Response.json({ error: "propId and actorUserId required" }, { status: 400 });
  }

  const prop = await prisma.prop.findFirst({ where: { id: propId, orgId } });
  if (!prop) return Response.json({ error: "Prop not found" }, { status: 404 });
  if (prop.status === "WRITTEN_OFF") return Response.json({ error: "Prop written off" }, { status: 400 });

  const open = await prisma.issue.findFirst({
    where: { orgId, propId, status: "OPEN" },
  });
  if (open) return Response.json({ error: "Already issued" }, { status: 400 });

  // MVP: кто выдал = админ (из seed)
  const issuedBy = await prisma.user.findFirst({
    where: { orgId, email: "admin@demo.local" },
    select: { id: true },
  });
  if (!issuedBy) return Response.json({ error: "issuedBy user not found" }, { status: 500 });

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

  return Response.json({ issue });
}