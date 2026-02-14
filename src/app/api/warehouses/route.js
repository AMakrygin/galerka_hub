import { prisma } from "@/lib/prisma";

export async function GET() {
  const orgId = "org_demo";
  const warehouses = await prisma.warehouse.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ warehouses });
}

export async function POST(req) {
  const orgId = "org_demo";
  const body = await req.json();
  const { name, address, comment } = body;

  if (!name?.trim()) {
    return Response.json({ error: "name required" }, { status: 400 });
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      orgId,
      name: name.trim(),
      address: address?.trim() || null,
      comment: comment?.trim() || null,
    },
  });

  return Response.json({ warehouse });
}