import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";

export async function POST(req) {
  const orgId = getOrgId();
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const name = (body.name || "").trim();
  const description = (body.description || "").trim();
  const inventoryNumber = (body.inventoryNumber || "").trim();
  const containerId = body.containerId;

  if (!name) return fail("name required", 400);
  if (!containerId) return fail("containerId required", 400);

  const container = await prisma.container.findFirst({
    where: { id: containerId, orgId },
  });
  if (!container) return fail("container not found", 404);

  const createdBy = await prisma.user.findFirst({
    where: { orgId, email: "admin@demo.local" },
    select: { id: true },
  });
  if (!createdBy) return fail("createdBy user not found", 500);

  const prop = await prisma.prop.create({
    data: {
      orgId,
      name,
      description: description || null,
      inventoryNumber: inventoryNumber || null,
      status: "IN_STORAGE",
      currentContainerId: containerId,
      createdByUserId: createdBy.id,
    },
  });

  return ok({ prop }, 201);
}