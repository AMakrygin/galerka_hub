import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";
import { mapAssignment } from "@/lib/contracts";
import { getSystemUser } from "@/lib/services/context";
import { logActivity } from "@/lib/services/activity";

export async function GET(req) {
  const orgId = getOrgId(req);
  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "").trim();

  const assignments = await prisma.issue.findMany({
    where: {
      orgId,
      ...(status === "issued" ? { status: "OPEN" } : {}),
      ...(status === "returned" ? { status: "CLOSED" } : {}),
    },
    orderBy: { issuedAt: "desc" },
    include: {
      prop: true,
      actor: true,
    },
  });

  const data = assignments.map(mapAssignment).filter((item) => (status ? item.status === status : true));
  return ok({ assignments: data });
}

export async function POST(req) {
  const orgId = getOrgId(req);
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const propId = (body.propId || "").trim();
  const actorId = (body.actorId || body.actorUserId || "").trim();
  const performance = (body.performance || "").trim();
  const expectedReturn = (body.expectedReturn || body.returnDate || "").trim();
  const comment = (body.comment || body.notes || "").trim();

  if (!propId || !actorId) return fail("propId and actorId required", 400);

  const [prop, actor] = await Promise.all([
    prisma.prop.findFirst({ where: { id: propId, orgId } }),
    prisma.user.findFirst({ where: { id: actorId, orgId, role: "ACTOR" } }),
  ]);

  if (!prop) return fail("prop not found", 404);
  if (!actor) return fail("actor not found", 404);
  if (prop.status === "WRITTEN_OFF") return fail("prop written off", 400);

  const existing = await prisma.issue.findFirst({ where: { orgId, propId, status: "OPEN" } });
  if (existing) return fail("prop already assigned", 400);

  const systemUser = await getSystemUser(orgId);

  const assignment = await prisma.$transaction(async (tx) => {
    const created = await tx.issue.create({
      data: {
        orgId,
        propId,
        actorUserId: actorId,
        issuedByUserId: systemUser.id,
        status: "OPEN",
        performance: performance || null,
        expectedReturnAt: expectedReturn ? new Date(expectedReturn) : null,
        comment: comment || null,
      },
      include: {
        prop: true,
        actor: true,
      },
    });

    await tx.prop.update({
      where: { id: propId },
      data: {
        status: "ISSUED",
        currentContainerId: null,
      },
    });

    await logActivity(tx, {
      orgId,
      actorUserId: systemUser.id,
      action: "PROP_ISSUED",
      entityType: "ASSIGNMENT",
      entityId: created.id,
      meta: {
        type: "prop_issued",
        description: `${created.prop.name} выдан ${created.actor.name}`,
      },
    });

    return created;
  });

  return ok({ assignment: mapAssignment(assignment) }, 201);
}
