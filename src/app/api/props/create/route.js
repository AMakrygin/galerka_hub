import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const orgId = "org_demo";
  const body = await req.json();

  const name = (body.name || "").trim();
  const description = (body.description || "").trim();
  const inventoryNumber = (body.inventoryNumber || "").trim();
  const containerId = body.containerId;

  if (!name) return Response.json({ error: "name required" }, { status: 400 });
  if (!containerId) return Response.json({ error: "containerId required" }, { status: 400 });

  const container = await prisma.container.findFirst({
    where: { id: containerId, orgId },
  });
  if (!container) return Response.json({ error: "container not found" }, { status: 404 });

  // MVP: кто создал = admin из seed
  const createdBy = await prisma.user.findFirst({
    where: { orgId, email: "admin@demo.local" },
    select: { id: true },
  });
  if (!createdBy) return Response.json({ error: "createdBy user not found" }, { status: 500 });

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

  return Response.json({ prop });
}