import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";
import { mapActor } from "@/lib/contracts";

export async function GET(req) {
  const orgId = getOrgId(req);

  try {
    const actors = await prisma.user.findMany({
      where: { orgId, role: "ACTOR" },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            actorIssues: {
              where: { status: "OPEN" },
            },
          },
        },
      },
    });

    return ok({ actors: actors.map(mapActor) });
  } catch {
    return fail("failed to fetch actors", 500);
  }
}

export async function POST(req) {
  const orgId = getOrgId(req);
  const body = await parseJsonSafe(req);
  if (!body) return fail("invalid json body", 400);

  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const role = (body.role || "").trim();
  const phone = (body.phone || "").trim();
  const photo = (body.photo || "").trim();
  const performances = Array.isArray(body.performances)
    ? body.performances.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];

  if (!name) return fail("name required", 400);
  if (!email) return fail("email required", 400);

  try {
    const actor = await prisma.user.create({
      data: {
        orgId,
        name,
        email,
        role: "ACTOR",
        title: role || null,
        phone: phone || null,
        photoUrl: photo || null,
        performances,
      },
      include: {
        _count: {
          select: {
            actorIssues: {
              where: { status: "OPEN" },
            },
          },
        },
      },
    });

    return ok({ actor: mapActor(actor) }, 201);
  } catch {
    return fail("cannot create actor (maybe email already exists)", 400);
  }
}