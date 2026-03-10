import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";

export async function GET() {
  const orgId = getOrgId();

  try {
    const actors = await prisma.user.findMany({
      where: { orgId, role: "ACTOR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    });

    return ok({ actors });
  } catch {
    return fail("failed to fetch actors", 500);
  }
}

export async function POST(req) {
  const orgId = getOrgId();
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();

  if (!name) return fail("name required", 400);
  if (!email) return fail("email required", 400);

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

    return ok({ actor }, 201);
  } catch {
    return fail("cannot create actor (maybe email already exists)", 400);
  }
}