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

export async function POST(req) {
  const orgId = "org_demo";
  const body = await req.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();

  if (!name) return Response.json({ error: "name required" }, { status: 400 });
  if (!email) return Response.json({ error: "email required" }, { status: 400 });

  try {
    const actor = await prisma.user.create({
      data: {
        orgId,
        name,
        email,
        role: "ACTOR",
      },
      select: { id: true, name: true, email: true },
    });

    return Response.json({ actor });
  } catch (e) {
    return Response.json({ error: "cannot create actor (maybe email already exists)" }, { status: 400 });
  }
}