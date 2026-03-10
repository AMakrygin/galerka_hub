import { prisma } from "@/lib/prisma";
import { getOrgId, ok } from "@/lib/api";

export async function GET(req) {
  const orgId = getOrgId(req);

  const [totalProps, inUse, available, missing, damaged, writeOffsThisMonth] = await Promise.all([
    prisma.prop.count({ where: { orgId } }),
    prisma.prop.count({ where: { orgId, status: "ISSUED" } }),
    prisma.prop.count({ where: { orgId, status: "IN_STORAGE" } }),
    prisma.prop.count({ where: { orgId, status: "MISSING" } }),
    prisma.prop.count({ where: { orgId, status: "DAMAGED" } }),
    prisma.writeOff.count({
      where: {
        orgId,
        writtenOffAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return ok({
    summary: {
      totalProps,
      propsInUse: inUse,
      availableProps: available,
      missingProps: missing,
      writeOffsThisMonth,
      damagedProps: damaged,
    },
  });
}
