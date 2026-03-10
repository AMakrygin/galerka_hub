import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";
import { mapWriteOff } from "@/lib/contracts";
import { getSystemUser } from "@/lib/services/context";
import { logActivity } from "@/lib/services/activity";

export async function GET(req) {
  const orgId = getOrgId(req);

  const writeOffs = await prisma.writeOff.findMany({
    where: { orgId },
    orderBy: { writtenOffAt: "desc" },
    include: {
      prop: true,
      writtenOffBy: true,
    },
  });

  return ok({ writeOffs: writeOffs.map(mapWriteOff) });
}

export async function POST(req) {
  const orgId = getOrgId(req);
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const propId = (body.propId || "").trim();
  const reason = (body.reason || body.reasonDescription || "").trim();
  const approvedBy = (body.approvedBy || "").trim();
  const photo = (body.photo || "").trim();

  if (!propId) return fail("propId required", 400);
  if (!reason) return fail("reason required", 400);

  const prop = await prisma.prop.findFirst({ where: { id: propId, orgId } });
  if (!prop) return fail("prop not found", 404);

  const existing = await prisma.writeOff.findFirst({ where: { orgId, propId } });
  if (existing) return fail("prop already written off", 400);

  const systemUser = await getSystemUser(orgId);

  const writeOff = await prisma.$transaction(async (tx) => {
    const created = await tx.writeOff.create({
      data: {
        orgId,
        propId,
        writtenOffByUserId: systemUser.id,
        approvedByName: approvedBy || systemUser.name,
        reason,
        comment: reason,
        photoUrl: photo || null,
      },
      include: {
        prop: true,
        writtenOffBy: true,
      },
    });

    await tx.prop.update({
      where: { id: propId },
      data: {
        status: "WRITTEN_OFF",
        currentContainerId: null,
      },
    });

    await tx.issue.updateMany({
      where: { orgId, propId, status: "OPEN" },
      data: {
        status: "CLOSED",
        returnedAt: new Date(),
        returnedByUserId: systemUser.id,
      },
    });

    await logActivity(tx, {
      orgId,
      actorUserId: systemUser.id,
      action: "WRITE_OFF",
      entityType: "WRITEOFF",
      entityId: created.id,
      meta: {
        type: "write_off",
        description: `${created.prop.name} списан: ${reason}`,
      },
    });

    return created;
  });

  return ok({ writeOff: mapWriteOff(writeOff) }, 201);
}
