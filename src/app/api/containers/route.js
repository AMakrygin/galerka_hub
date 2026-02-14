import { prisma } from "@/lib/prisma";

export async function GET() {
  const orgId = "org_demo";

  const containers = await prisma.container.findMany({
    where: { orgId },
    include: { warehouse: true },
    orderBy: { name: "asc" },
  });

  return Response.json({ containers });
}