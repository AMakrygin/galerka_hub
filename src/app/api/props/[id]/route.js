import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const orgId = "org_demo";
  const { id } = await params;   // ← ВОТ ЭТО НУЖНО

  const prop = await prisma.prop.findFirst({
    where: { id, orgId },
    include: {
      currentContainer: { include: { warehouse: true } },
      issues: {
        orderBy: { issuedAt: "desc" },
        include: { actor: true, issuedBy: true, returnedBy: true },
      },
      writeOff: true,
    },
  });

  if (!prop) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ prop });
}