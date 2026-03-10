import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";
import { mapProp, toDbPropStatus } from "@/lib/contracts";
import { getSystemUser } from "@/lib/services/context";
import { logActivity } from "@/lib/services/activity";

export async function GET(req, { params }) {
  const orgId = getOrgId(req);
  const { id } = await params;

  try {
    const prop = await prisma.prop.findFirst({
      where: { id, orgId },
      include: {
        currentContainer: { include: { warehouse: true, parent: true } },
        issues: {
          orderBy: { issuedAt: "desc" },
          include: { actor: true, issuedBy: true, returnedBy: true },
        },
        writeOff: true,
      },
    });

    if (!prop) return fail("prop not found", 404);
    return ok({ prop: mapProp(prop) });
  } catch {
    return fail("failed to fetch prop", 500);
  }
}

export async function PATCH(req, { params }) {
  const orgId = getOrgId(req);
  const { id } = await params;
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const existing = await prisma.prop.findFirst({ where: { id, orgId } });
  if (!existing) return fail("prop not found", 404);

  const patch = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.category === "string") patch.category = body.category.trim() || null;
  if (typeof body.description === "string") patch.description = body.description.trim() || null;
  if (typeof body.photo === "string") patch.photoUrl = body.photo.trim() || null;
  if (typeof body.qrCode === "string") {
    const normalizedQr = body.qrCode.trim() || null;
    patch.qrCode = normalizedQr;
    patch.inventoryNumber = normalizedQr;
  }
  if (typeof body.status === "string") {
    const dbStatus = toDbPropStatus(body.status);
    if (!dbStatus) return fail("invalid status", 400);
    patch.status = dbStatus;
  }

  if (typeof body.containerId === "string") {
    const containerId = body.containerId.trim();
    if (!containerId) {
      patch.currentContainerId = null;
    } else {
      const container = await prisma.container.findFirst({ where: { id: containerId, orgId } });
      if (!container) return fail("container not found", 404);
      patch.currentContainerId = containerId;
    }
  }

  const systemUser = await getSystemUser(orgId);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const prop = await tx.prop.update({
        where: { id },
        data: patch,
        include: {
          currentContainer: { include: { warehouse: true, parent: true } },
          issues: {
            where: { status: "OPEN" },
            include: { actor: true },
            orderBy: { issuedAt: "desc" },
            take: 1,
          },
        },
      });

      await logActivity(tx, {
        orgId,
        actorUserId: systemUser.id,
        action: "PROP_UPDATED",
        entityType: "PROP",
        entityId: id,
        meta: {
          type: "prop_added",
          description: `Обновлён реквизит: ${prop.name}`,
        },
      });

      return prop;
    });

    return ok({ prop: mapProp(updated) });
  } catch {
    return fail("failed to update prop", 400);
  }
}

export async function DELETE(req, { params }) {
  const orgId = getOrgId(req);
  const { id } = await params;

  const prop = await prisma.prop.findFirst({ where: { id, orgId } });
  if (!prop) return fail("prop not found", 404);

  const openIssue = await prisma.issue.findFirst({ where: { orgId, propId: id, status: "OPEN" } });
  if (openIssue) return fail("cannot delete issued prop", 400);

  await prisma.prop.delete({ where: { id } });
  return new Response(null, { status: 204 });
}