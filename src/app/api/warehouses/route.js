import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";

export async function GET() {
  const orgId = getOrgId();

  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
    return ok({ warehouses });
  } catch {
    return fail("failed to fetch warehouses", 500);
  }
}

export async function POST(req) {
  const orgId = getOrgId();
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const { name, address, comment } = body;

  if (!name?.trim()) {
    return fail("name required", 400);
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      orgId,
      name: name.trim(),
      address: address?.trim() || null,
      comment: comment?.trim() || null,
    },
  });

  return ok({ warehouse }, 201);
}