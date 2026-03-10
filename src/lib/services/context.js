import { prisma } from "@/lib/prisma";

export async function getSystemUser(orgId) {
  let user = await prisma.user.findFirst({
    where: { orgId, email: "admin@demo.local" },
    select: { id: true, name: true, email: true },
  });

  if (user) return user;

  user = await prisma.user.findFirst({
    where: { orgId, role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });

  if (user) return user;

  return prisma.user.create({
    data: {
      orgId,
      email: `admin+${orgId}@demo.local`,
      name: "System Admin",
      role: "ADMIN",
    },
    select: { id: true, name: true, email: true },
  });
}
