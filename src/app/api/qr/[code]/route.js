import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const orgId = "org_demo"; // MVP: фиксированный org

  const container = await prisma.container.findFirst({
    where: { orgId, qrCode: params.code },
    include: {
      warehouse: true,
      props: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!container) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ container });
}