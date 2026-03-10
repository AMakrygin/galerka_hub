import { prisma } from "@/lib/prisma";
import { getOrgId, ok } from "@/lib/api";

function monthLabel(date) {
  return new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(date).replace(".", "");
}

function getMonthBuckets() {
  const now = new Date();
  const buckets = [];

  for (let offset = 5; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      month: monthLabel(d),
      added: 0,
      issued: 0,
      returned: 0,
      writeOffs: 0,
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });
  }

  return buckets;
}

export async function GET() {
  const orgId = getOrgId();
  const buckets = getMonthBuckets();

  for (const bucket of buckets) {
    const [added, issued, returned, writeOffs] = await Promise.all([
      prisma.prop.count({
        where: {
          orgId,
          createdAt: { gte: bucket.start, lt: bucket.end },
        },
      }),
      prisma.issue.count({
        where: {
          orgId,
          issuedAt: { gte: bucket.start, lt: bucket.end },
        },
      }),
      prisma.issue.count({
        where: {
          orgId,
          returnedAt: { gte: bucket.start, lt: bucket.end },
        },
      }),
      prisma.writeOff.count({
        where: {
          orgId,
          writtenOffAt: { gte: bucket.start, lt: bucket.end },
        },
      }),
    ]);

    bucket.added = added;
    bucket.issued = issued;
    bucket.returned = returned;
    bucket.writeOffs = writeOffs;
  }

  return ok({
    data: buckets.map(({ month, added, issued, returned, writeOffs }) => ({
      month,
      added,
      issued,
      returned,
      writeOffs,
    })),
  });
}
