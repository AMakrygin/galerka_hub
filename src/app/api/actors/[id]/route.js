import { prisma } from "@/lib/prisma";
import { fail, getOrgId, ok, parseJsonSafe } from "@/lib/api";
import { mapActor, mapAssignment } from "@/lib/contracts";

export async function GET(req, { params }) {
  const orgId = getOrgId(req);
  const { id } = await params;

  try {
    const actor = await prisma.user.findFirst({
      where: { id, orgId, role: "ACTOR" },
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

    if (!actor) {
      return fail("актёр не найден", 404);
    }

    const openIssues = await prisma.issue.findMany({
      where: { orgId, actorUserId: id, status: "OPEN" },
      orderBy: { issuedAt: "desc" },
      include: {
        prop: true,
        actor: true,
      },
    });

    const history = await prisma.issue.findMany({
      where: { orgId, actorUserId: id },
      orderBy: { issuedAt: "desc" },
      take: 50,
      include: {
        prop: true,
        actor: true,
      },
    });

    return ok({
      actor: mapActor(actor),
      openAssignments: openIssues.map(mapAssignment),
      history: history.map(mapAssignment),
    });
  } catch {
    return fail("не удалось получить актёра", 500);
  }
}

export async function DELETE(req, { params }) {
  const orgId = getOrgId(req);
  const { id } = await params;

  try {
    const actor = await prisma.user.findFirst({
      where: { id, orgId, role: "ACTOR" },
      select: { id: true },
    });

    if (!actor) {
      return fail("актёр не найден", 404);
    }

    const openIssues = await prisma.issue.count({
      where: { orgId, actorUserId: id, status: "OPEN" },
    });

    if (openIssues > 0) {
      return fail("у актёра есть активные выдачи", 400);
    }

    await prisma.user.delete({
      where: { id: actor.id },
    });

    return ok({ deleted: true });
  } catch {
    return fail("не удалось удалить актёра", 500);
  }
}

export async function PATCH(req, { params }) {
  const orgId = getOrgId(req);
  const { id } = await params;

  try {
    const body = await parseJsonSafe(req);
    if (!body) return fail("некорректное тело JSON", 400);

    const actor = await prisma.user.findFirst({
      where: { id, orgId, role: "ACTOR" },
    });

    if (!actor) {
      return fail("актёр не найден", 404);
    }

    const data = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return fail("поле name обязательно", 400);
      }
      data.name = body.name.trim();
    }

    if (Object.prototype.hasOwnProperty.call(body, "role")) {
      if (body.role === null) {
        data.title = null;
      } else if (typeof body.role === "string") {
        data.title = body.role.trim() || null;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "email")) {
      if (typeof body.email !== "string" || !body.email.trim()) {
        return fail("поле email обязательно", 400);
      }

      const normalizedEmail = body.email.trim().toLowerCase();
      const existing = await prisma.user.findFirst({
        where: {
          orgId,
          email: normalizedEmail,
          NOT: { id: actor.id },
        },
        select: { id: true },
      });

      if (existing) {
        return fail("email уже используется", 400);
      }

      data.email = normalizedEmail;
    }

    if (Object.prototype.hasOwnProperty.call(body, "phone")) {
      if (body.phone === null) {
        data.phone = null;
      } else if (typeof body.phone === "string") {
        data.phone = body.phone.trim() || null;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "photo")) {
      if (body.photo === null) {
        data.photoUrl = null;
      } else if (typeof body.photo === "string") {
        data.photoUrl = body.photo.trim() || null;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "performances")) {
      if (!Array.isArray(body.performances)) {
        return fail("поле performances должно быть массивом", 400);
      }

      data.performances = body.performances
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    const updated = await prisma.user.update({
      where: { id: actor.id },
      data,
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

    return ok({ actor: mapActor(updated) });
  } catch {
    return fail("не удалось обновить актёра", 500);
  }
}