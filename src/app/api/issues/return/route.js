import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const orgId = "org_demo";
  const body = await req.json();

  const { propId, containerId } = body;

  if (!propId || !containerId) {
    return Response.json({ error: "propId and containerId required" }, { status: 400 });
  }

  const openIssue = await prisma.issue.findFirst({
    where: { orgId, propId, status: "OPEN" },
  });

  if (!openIssue) {
    return Response.json({ error: "No open issue found" }, { status: 400 });
  }

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

  return Response.json({ ok: result });
}