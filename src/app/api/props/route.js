import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok } from "@/lib/api";
import { parseJsonSafe } from "@/lib/api";
import { mapProp, toDbPropStatus } from "@/lib/contracts";
import { getSystemUser } from "@/lib/services/context";
import { logActivity } from "@/lib/services/activity";

export async function GET(req) {
  const orgId = getOrgId(req);

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const status = (url.searchParams.get("status") || "").trim();
    const category = (url.searchParams.get("category") || "").trim();
    const containerId = (url.searchParams.get("containerId") || "").trim();
    const dbStatus = toDbPropStatus(status);

    const props = await prisma.prop.findMany({
      where: {
        orgId,
        ...(dbStatus ? { status: dbStatus } : {}),
        ...(category ? { category } : {}),
        ...(containerId ? { currentContainerId: containerId } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { inventoryNumber: { contains: q, mode: "insensitive" } },
                { qrCode: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        currentContainer: { include: { warehouse: true, parent: true } },
        issues: {
          where: { status: "OPEN" },
          orderBy: { issuedAt: "desc" },
          take: 1,
          include: { actor: true },
        },
      },
    });

    return ok({ props: props.map(mapProp) });
  } catch {
    return fail("failed to fetch props", 500);
  }
}

export async function POST(req) {
  const orgId = getOrgId(req);
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const name = (body.name || "").trim();
  const category = (body.category || "").trim();
  const description = (body.description || "").trim();
  const photo = (body.photo || "").trim();
  const qrCode = (body.qrCode || body.inventoryNumber || "").trim();
  const containerId = (body.containerId || "").trim();

  if (!name) return fail("name required", 400);
  if (!containerId) return fail("containerId required", 400);

  const container = await prisma.container.findFirst({
    where: { id: containerId, orgId },
  });
  if (!container) return fail("container not found", 404);

  const systemUser = await getSystemUser(orgId);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const prop = await tx.prop.create({
        data: {
          orgId,
          name,
          category: category || null,
          photoUrl: photo || null,
          description: description || null,
          inventoryNumber: qrCode || null,
          qrCode: qrCode || null,
          status: "IN_STORAGE",
          currentContainerId: containerId,
          createdByUserId: systemUser.id,
        },
        include: {
          currentContainer: { include: { warehouse: true, parent: true } },
          issues: {
            where: { status: "OPEN" },
            include: { actor: true },
            take: 1,
          },
        },
      });

      await logActivity(tx, {
        orgId,
        actorUserId: systemUser.id,
        action: "PROP_ADDED",
        entityType: "PROP",
        entityId: prop.id,
        meta: {
          type: "prop_added",
          description: `Добавлен новый реквизит: ${prop.name}`,
        },
      });

      return prop;
    });

    return ok({ prop: mapProp(created) }, 201);
  } catch {
    return fail("failed to create prop", 400);
  }
}