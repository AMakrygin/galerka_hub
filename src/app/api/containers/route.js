import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";

function genQrCode() {
  // Короткий уникальный код, удобный для печати: C-<random>
  // пример: C-K9F3Q2X8
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `C-${rnd}`;
}

export async function GET() {
  const orgId = getOrgId();

  try {
    const containers = await prisma.container.findMany({
      where: { orgId },
      include: { warehouse: true, parent: true },
      orderBy: { createdAt: "desc" },
    });
    return ok({ containers });
  } catch {
    return fail("failed to fetch containers", 500);
  }
}

export async function POST(req) {
  const orgId = getOrgId();
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const { warehouseId, parentId, name, qrCode, comment } = body;

  if (!warehouseId) return fail("warehouseId required", 400);
  if (!name?.trim()) return fail("name required", 400);

  const wh = await prisma.warehouse.findFirst({ where: { id: warehouseId, orgId } });
  if (!wh) return fail("warehouse not found", 404);

  if (parentId) {
    const parent = await prisma.container.findFirst({ where: { id: parentId, orgId } });
    if (!parent) return fail("parent container not found", 404);
  }

  let finalQr = (qrCode || "").trim();

  for (let attempt = 0; attempt < 10; attempt++) {
    if (!finalQr) finalQr = genQrCode();

    try {
      const container = await prisma.container.create({
        data: {
          orgId,
          warehouseId,
          parentId: parentId || null,
          name: name.trim(),
          qrCode: finalQr,
          comment: comment?.trim() || null,
        },
      });

      return ok({ container }, 201);
    } catch {
      finalQr = "";
    }
  }

  return fail("cannot create container: failed to generate unique qrCode", 500);
}