import { prisma } from "@/lib/prisma";

function genQrCode() {
  // Короткий уникальный код, удобный для печати: C-<random>
  // пример: C-K9F3Q2X8
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `C-${rnd}`;
}

export async function GET() {
  const orgId = "org_demo";
  const containers = await prisma.container.findMany({
    where: { orgId },
    include: { warehouse: true, parent: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ containers });
}

export async function POST(req) {
  const orgId = "org_demo";
  const body = await req.json();
  const { warehouseId, parentId, name, qrCode, comment } = body;

  if (!warehouseId) return Response.json({ error: "warehouseId required" }, { status: 400 });
  if (!name?.trim()) return Response.json({ error: "name required" }, { status: 400 });

  const wh = await prisma.warehouse.findFirst({ where: { id: warehouseId, orgId } });
  if (!wh) return Response.json({ error: "warehouse not found" }, { status: 404 });

  if (parentId) {
    const parent = await prisma.container.findFirst({ where: { id: parentId, orgId } });
    if (!parent) return Response.json({ error: "parent container not found" }, { status: 404 });
  }

  // ✅ QR теперь не обязателен: если пустой — генерим
  let finalQr = (qrCode || "").trim();

  // На всякий случай защищаемся от коллизий (у нас @@unique([orgId, qrCode]))
  // Пробуем до 10 раз сгенерировать уникальный.
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

      return Response.json({ container });
    } catch (e) {
      // вероятнее всего конфликт уникальности qrCode — пробуем сгенерить новый
      finalQr = "";
    }
  }

  return Response.json(
    { error: "cannot create container: failed to generate unique qrCode" },
    { status: 500 }
  );
}