import { prisma } from "@/lib/prisma";

export async function GET() {
  const orgId = "org_demo";

  const actors = await prisma.user.findMany({
    where: { orgId, role: "ACTOR" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });

  return Response.json({ actors });
}