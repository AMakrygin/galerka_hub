const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

require("dotenv").config();

const GENERATED_ORG_PREFIX = "DEV_SEED::";
const PERFORMANCE_TITLES = ["Гамлет", "Чайка", "Вишнёвый сад", "Три сестры", "Дядя Ваня", "Ревизор", "Маскарад"];
const PROP_CATEGORIES = ["Освещение", "Аксессуары", "Оружие", "Электроника", "Книги", "Декор", "Мебель", "Текстиль"];
const PROP_NAME_PARTS = ["Сценическая", "Антикварная", "Винтажная", "Театральная", "Декоративная", "Историческая"];
const PROP_OBJECTS = ["лампа", "шпага", "маска", "ваза", "шляпа", "книга", "подсвечник", "часы", "бинокль", "накидка", "трость", "канделябр"];
const WRITE_OFF_REASONS = [
  "Невосстановимое повреждение во время спектакля",
  "Критический износ материалов",
  "Потеряно на выездной площадке",
  "Разрушение конструкции при транспортировке",
  "Не соответствует требованиям безопасности",
];

function parseArg(name, fallback = null) {
  const found = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (!found) return fallback;
  return found.split("=").slice(1).join("=");
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function createRng(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0xffffffff;
    },
    int(min, max) {
      return min + Math.floor(this.next() * (max - min + 1));
    },
    pick(items) {
      return items[this.int(0, items.length - 1)];
    },
    chance(probability) {
      return this.next() < probability;
    },
    sample(items, count) {
      const copy = [...items];
      const result = [];
      while (copy.length && result.length < count) {
        const index = this.int(0, copy.length - 1);
        result.push(copy[index]);
        copy.splice(index, 1);
      }
      return result;
    },
  };
}

function randomDateInLastMonths(rng, monthsBack = 12) {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - monthsBack);
  const ts = start.getTime() + Math.floor(rng.next() * (now.getTime() - start.getTime()));
  return new Date(ts);
}

async function deleteOrgTree(prisma, orgId) {
  await prisma.auditLog.deleteMany({ where: { orgId } });
  await prisma.media.deleteMany({ where: { orgId } });
  await prisma.issue.deleteMany({ where: { orgId } });
  await prisma.writeOff.deleteMany({ where: { orgId } });
  await prisma.prop.deleteMany({ where: { orgId } });
  await prisma.container.deleteMany({ where: { orgId } });
  await prisma.warehouse.deleteMany({ where: { orgId } });
  await prisma.user.deleteMany({ where: { orgId } });
  await prisma.org.deleteMany({ where: { id: orgId } });
}

async function cleanupGeneratedOrgs(prisma, options) {
  const { olderThan, targetOrgId } = options;

  const orgs = await prisma.org.findMany({
    where: {
      ...(targetOrgId ? { id: targetOrgId } : { name: { startsWith: GENERATED_ORG_PREFIX } }),
      ...(olderThan ? { createdAt: { lt: olderThan } } : {}),
    },
    select: { id: true, name: true, createdAt: true },
  });

  for (const org of orgs) {
    console.log(`Cleaning org ${org.id} (${org.name})`);
    await deleteOrgTree(prisma, org.id);
  }

  return orgs.length;
}

function makeQr(orgTag, index) {
  return `${orgTag}-QR-${String(index).padStart(5, "0")}`;
}

function makePropName(rng) {
  return `${rng.pick(PROP_NAME_PARTS)} ${rng.pick(PROP_OBJECTS)}`;
}

function makePhotoUrl(kind, id) {
  return `https://picsum.photos/seed/galerka-${kind}-${id}/800/600`;
}

async function seedOrg(prisma, rng, params) {
  const {
    orgIndex,
    usersPerOrg,
    propsPerOrg,
    issuesPerOrg,
    writeOffsPerOrg,
    mediaPerOrg,
    auditPerOrg,
    monthsBack,
  } = params;

  const orgName = `${GENERATED_ORG_PREFIX} Театр ${orgIndex + 1}`;
  const org = await prisma.org.create({ data: { name: orgName } });

  const admin = await prisma.user.create({
    data: {
      orgId: org.id,
      email: `admin.${orgIndex + 1}@seed.local`,
      name: `Администратор ${orgIndex + 1}`,
      role: "ADMIN",
      title: "Администратор системы",
      photoUrl: makePhotoUrl("user", `admin-${orgIndex + 1}`),
    },
  });

  const costumerCount = Math.max(1, Math.floor(usersPerOrg * 0.2));
  const actorCount = Math.max(4, usersPerOrg - 1 - costumerCount);

  const costumers = [];
  for (let i = 0; i < costumerCount; i++) {
    costumers.push(
      await prisma.user.create({
        data: {
          orgId: org.id,
          email: `costumer.${orgIndex + 1}.${i + 1}@seed.local`,
          name: `Завпост ${orgIndex + 1}-${i + 1}`,
          role: "COSTUMER",
          title: "Заведующий постановочной частью",
          photoUrl: makePhotoUrl("user", `costumer-${orgIndex + 1}-${i + 1}`),
        },
      })
    );
  }

  const actors = [];
  for (let i = 0; i < actorCount; i++) {
    actors.push(
      await prisma.user.create({
        data: {
          orgId: org.id,
          email: `actor.${orgIndex + 1}.${i + 1}@seed.local`,
          name: `Актёр ${orgIndex + 1}-${i + 1}`,
          role: "ACTOR",
          title: rng.pick(["Ведущий актёр", "Актёр второго плана", "Ансамбль"]),
          phone: `+7999${String(orgIndex + 1).padStart(2, "0")}${String(i + 1).padStart(2, "0")}${String(rng.int(1000, 9999))}`,
          photoUrl: makePhotoUrl("actor", `${orgIndex + 1}-${i + 1}`),
          performances: rng.sample(PERFORMANCE_TITLES, rng.int(2, 4)),
        },
      })
    );
  }

  const allStaff = [admin, ...costumers];

  const warehouses = [];
  for (let i = 0; i < rng.int(1, 2); i++) {
    warehouses.push(
      await prisma.warehouse.create({
        data: {
          orgId: org.id,
          name: `Склад ${i + 1}`,
          address: `Корпус ${String.fromCharCode(65 + i)}, этаж ${rng.int(1, 3)}`,
          comment: "Сгенерировано seed-скриптом",
        },
      })
    );
  }

  const rooms = [];
  const shelves = [];
  const bins = [];
  let qrIndex = 1;

  for (const warehouse of warehouses) {
    const roomCount = rng.int(2, 3);
    for (let r = 0; r < roomCount; r++) {
      const room = await prisma.container.create({
        data: {
          orgId: org.id,
          warehouseId: warehouse.id,
          name: `Комната ${r + 1}`,
          location: warehouse.name,
          type: "ROOM",
          capacity: rng.int(80, 200),
          qrCode: makeQr(`ORG${orgIndex + 1}`, qrIndex++),
        },
      });
      rooms.push(room);

      const shelfCount = rng.int(2, 4);
      for (let s = 0; s < shelfCount; s++) {
        const shelf = await prisma.container.create({
          data: {
            orgId: org.id,
            warehouseId: warehouse.id,
            parentId: room.id,
            name: `Стеллаж ${String.fromCharCode(65 + s)}`,
            location: room.name,
            type: "SHELF",
            capacity: rng.int(20, 80),
            qrCode: makeQr(`ORG${orgIndex + 1}`, qrIndex++),
          },
        });
        shelves.push(shelf);

        const binCount = rng.int(2, 4);
        for (let b = 0; b < binCount; b++) {
          const bin = await prisma.container.create({
            data: {
              orgId: org.id,
              warehouseId: warehouse.id,
              parentId: shelf.id,
              name: `Контейнер ${String.fromCharCode(65 + s)}${b + 1}`,
              location: shelf.name,
              type: "CONTAINER",
              capacity: rng.int(8, 24),
              qrCode: makeQr(`ORG${orgIndex + 1}`, qrIndex++),
            },
          });
          bins.push(bin);
        }
      }
    }
  }

  const props = [];
  for (let i = 0; i < propsPerOrg; i++) {
    const creator = rng.pick(allStaff);
    const statusRoll = rng.next();
    const status =
      statusRoll < 0.54
        ? "IN_STORAGE"
        : statusRoll < 0.77
          ? "ISSUED"
          : statusRoll < 0.88
            ? "DAMAGED"
            : statusRoll < 0.94
              ? "MISSING"
              : "WRITTEN_OFF";

    const container = status === "ISSUED" || status === "MISSING" || status === "WRITTEN_OFF" ? null : rng.pick(bins);
    const createdAt = randomDateInLastMonths(rng, monthsBack);

    const prop = await prisma.prop.create({
      data: {
        orgId: org.id,
        name: makePropName(rng),
        category: rng.pick(PROP_CATEGORIES),
        photoUrl: makePhotoUrl("prop", `${orgIndex + 1}-${i + 1}`),
        qrCode: makeQr(`P${orgIndex + 1}`, i + 1),
        inventoryNumber: `INV-${orgIndex + 1}-${String(i + 1).padStart(4, "0")}`,
        description: `Реквизит для постановки ${rng.pick(PERFORMANCE_TITLES)}. Состояние: ${status}.`,
        status,
        currentContainerId: container?.id || null,
        createdAt,
        createdByUserId: creator.id,
      },
    });
    props.push(prop);
  }

  const openIssuePropIds = new Set();
  const issues = [];

  const writableProps = props.filter((p) => p.status !== "WRITTEN_OFF");
  for (let i = 0; i < issuesPerOrg; i++) {
    const prop = rng.pick(writableProps);
    if (!prop) break;
    if (openIssuePropIds.has(prop.id)) continue;

    const actor = rng.pick(actors);
    const issuedBy = rng.pick(allStaff);
    const isOpen = rng.chance(0.35);
    const issuedAt = randomDateInLastMonths(rng, monthsBack);
    const expectedReturnAt = new Date(issuedAt.getTime() + rng.int(3, 30) * 86400000);
    const returnedAt = isOpen ? null : new Date(expectedReturnAt.getTime() + rng.int(-2, 14) * 86400000);
    const returnPlannedAt = expectedReturnAt;

    const issue = await prisma.issue.create({
      data: {
        orgId: org.id,
        propId: prop.id,
        actorUserId: actor.id,
        issuedByUserId: issuedBy.id,
        status: isOpen ? "OPEN" : "CLOSED",
        issuedAt,
        expectedReturnAt,
        returnPlannedAt,
        returnedAt,
        returnedByUserId: returnedAt ? rng.pick(allStaff).id : null,
        performance: rng.pick(actor.performances.length ? actor.performances : PERFORMANCE_TITLES),
        comment: rng.chance(0.35) ? "Выдано для ближайшей репетиции" : null,
        remindedAt: isOpen && expectedReturnAt < new Date() && rng.chance(0.5) ? new Date(expectedReturnAt.getTime() + 86400000) : null,
      },
    });
    issues.push(issue);

    if (isOpen) openIssuePropIds.add(prop.id);
  }

  const toIssued = props.filter((p) => openIssuePropIds.has(p.id));
  if (toIssued.length) {
    await prisma.prop.updateMany({
      where: { id: { in: toIssued.map((p) => p.id) } },
      data: { status: "ISSUED", currentContainerId: null },
    });
  }

  const writeOffCandidates = props.filter((p) => p.status === "WRITTEN_OFF").slice(0, writeOffsPerOrg);
  if (writeOffCandidates.length < writeOffsPerOrg) {
    const missing = writeOffsPerOrg - writeOffCandidates.length;
    const extraCandidates = props
      .filter((p) => p.status !== "ISSUED" && p.status !== "WRITTEN_OFF")
      .slice(0, missing);

    for (const extraProp of extraCandidates) {
      await prisma.prop.update({
        where: { id: extraProp.id },
        data: {
          status: "WRITTEN_OFF",
          currentContainerId: null,
        },
      });
      extraProp.status = "WRITTEN_OFF";
      writeOffCandidates.push(extraProp);
    }
  }

  const writeOffs = [];
  for (let i = 0; i < writeOffCandidates.length; i++) {
    const prop = writeOffCandidates[i];
    const writtenOffBy = rng.pick(allStaff);
    writeOffs.push(
      await prisma.writeOff.create({
        data: {
          orgId: org.id,
          propId: prop.id,
          writtenOffByUserId: writtenOffBy.id,
          writtenOffAt: randomDateInLastMonths(rng, monthsBack),
          reason: rng.pick(WRITE_OFF_REASONS),
          comment: "Акт списания сформирован автоматически",
          photoUrl: makePhotoUrl("writeoff", `${orgIndex + 1}-${i + 1}`),
          approvedByName: writtenOffBy.name,
        },
      })
    );
  }

  for (let i = 0; i < mediaPerOrg; i++) {
    const targetType = rng.pick(["CONTAINER", "PROP", "WRITEOFF"]);
    const targetId =
      targetType === "CONTAINER"
        ? rng.pick(bins)?.id || rng.pick(shelves)?.id || rng.pick(rooms)?.id
        : targetType === "PROP"
          ? rng.pick(props)?.id
          : rng.pick(writeOffs)?.id;

    if (!targetId) continue;

    await prisma.media.create({
      data: {
        orgId: org.id,
        entityType: targetType,
        entityId: targetId,
        url: makePhotoUrl("media", `${orgIndex + 1}-${i + 1}`),
        caption: `Медиа ${targetType.toLowerCase()} #${i + 1}`,
        createdAt: randomDateInLastMonths(rng, monthsBack),
        createdByUserId: rng.pick([...allStaff, ...actors]).id,
      },
    });
  }

  for (const prop of props) {
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        actorUserId: prop.createdByUserId,
        action: "PROP_ADDED",
        entityType: "PROP",
        entityId: prop.id,
        createdAt: prop.createdAt,
        meta: {
          type: "prop_added",
          description: `Добавлен новый реквизит: ${prop.name}`,
        },
      },
    });
  }

  for (const issue of issues) {
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        actorUserId: issue.issuedByUserId,
        action: "PROP_ISSUED",
        entityType: "ASSIGNMENT",
        entityId: issue.id,
        createdAt: issue.issuedAt,
        meta: {
          type: "prop_issued",
          description: `Реквизит выдан актёру (${issue.performance || "без спектакля"})`,
        },
      },
    });

    if (issue.returnedAt) {
      await prisma.auditLog.create({
        data: {
          orgId: org.id,
          actorUserId: issue.returnedByUserId || issue.issuedByUserId,
          action: "PROP_RETURNED",
          entityType: "ASSIGNMENT",
          entityId: issue.id,
          createdAt: issue.returnedAt,
          meta: {
            type: "prop_returned",
            description: "Реквизит возвращён на склад",
          },
        },
      });
    } else if (issue.remindedAt) {
      await prisma.auditLog.create({
        data: {
          orgId: org.id,
          actorUserId: issue.issuedByUserId,
          action: "ASSIGNMENT_REMINDER",
          entityType: "ASSIGNMENT",
          entityId: issue.id,
          createdAt: issue.remindedAt,
          meta: {
            type: "actor_assigned",
            description: "Отправлено напоминание о возврате",
          },
        },
      });
    }
  }

  for (const writeOff of writeOffs) {
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        actorUserId: writeOff.writtenOffByUserId,
        action: "WRITE_OFF",
        entityType: "WRITEOFF",
        entityId: writeOff.id,
        createdAt: writeOff.writtenOffAt,
        meta: {
          type: "write_off",
          description: `Реквизит списан: ${writeOff.reason || "без причины"}`,
        },
      },
    });
  }

  const currentAuditCount = await prisma.auditLog.count({ where: { orgId: org.id } });
  for (let i = currentAuditCount; i < auditPerOrg; i++) {
    const actor = rng.pick([...allStaff, ...actors]);
    const targetProp = rng.pick(props);
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        actorUserId: actor.id,
        action: "PROP_UPDATED",
        entityType: "PROP",
        entityId: targetProp.id,
        createdAt: randomDateInLastMonths(rng, monthsBack),
        meta: {
          type: "prop_added",
          description: `Обновлены данные реквизита: ${targetProp.name}`,
        },
      },
    });
  }

  return {
    orgId: org.id,
    orgName: org.name,
    users: 1 + costumers.length + actors.length,
    warehouses: warehouses.length,
    containers: rooms.length + shelves.length + bins.length,
    props: props.length,
    issues: issues.length,
    writeOffs: writeOffs.length,
  };
}

function printHelp() {
  console.log(`\nGalerkaHub seed CLI\n\nUsage:\n  node prisma/seed.js [options]\n\nOptions:\n  --seed=<number>                 RNG seed (default: 20260310)\n  --orgs=<1..3>                   Generated organizations count (default: 2)\n  --users=<10..30>                Users per org (default: 16)\n  --props=<100..300>              Props per org (default: 140)\n  --issues=<50..150>              Issues per org (default: 90)\n  --writeoffs=<10..30>            WriteOffs per org (default: 18)\n  --media=<number>                Media per org (default: 45)\n  --audit=<number>                Audit logs per org (default: 140)\n  --months=<6..12>                History depth in months (default: 10)\n\nCleanup options:\n  --reset-generated               Delete orgs with prefix ${GENERATED_ORG_PREFIX}\n  --target-org=<orgId>            Cleanup only one org by id\n  --purge-older-than=YYYY-MM-DD   Delete generated orgs older than date\n\nSafety:\n  --all-orgs --force              Delete ALL orgs (dangerous, dev only)\n  --cleanup-only                  Only cleanup, do not seed new data\n  --help                          Show this help\n`);
}

async function main() {
  if (hasFlag("help")) {
    printHelp();
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const seedValue = toInt(parseArg("seed", "20260310"), 20260310);
  const rng = createRng(seedValue);

  const orgsCount = Math.min(Math.max(toInt(parseArg("orgs", "2"), 2), 1), 3);
  const usersPerOrg = Math.min(Math.max(toInt(parseArg("users", "16"), 16), 10), 30);
  const propsPerOrg = Math.min(Math.max(toInt(parseArg("props", "140"), 140), 100), 300);
  const issuesPerOrg = Math.min(Math.max(toInt(parseArg("issues", "90"), 90), 50), 150);
  const writeOffsPerOrg = Math.min(Math.max(toInt(parseArg("writeoffs", "18"), 18), 10), 30);
  const mediaPerOrg = Math.max(toInt(parseArg("media", "45"), 45), 10);
  const auditPerOrg = Math.max(toInt(parseArg("audit", "140"), 140), 100);
  const monthsBack = Math.min(Math.max(toInt(parseArg("months", "10"), 10), 6), 12);

  const resetGenerated = hasFlag("reset-generated");
  const cleanupOnly = hasFlag("cleanup-only");
  const targetOrgId = parseArg("target-org", null);
  const olderThanRaw = parseArg("purge-older-than", null);
  const olderThan = olderThanRaw ? new Date(`${olderThanRaw}T00:00:00.000Z`) : null;
  const allOrgs = hasFlag("all-orgs");
  const force = hasFlag("force");

  if (allOrgs && !force) {
    throw new Error("--all-orgs requires --force (safety guard)");
  }

  try {
    if (allOrgs && force) {
      const all = await prisma.org.findMany({ select: { id: true } });
      for (const org of all) {
        await deleteOrgTree(prisma, org.id);
      }
      console.log(`Deleted all org trees: ${all.length}`);
    } else if (resetGenerated || targetOrgId || olderThan || cleanupOnly) {
      const removed = await cleanupGeneratedOrgs(prisma, { olderThan, targetOrgId });
      console.log(`Cleanup removed orgs: ${removed}`);
    }

    if (!cleanupOnly) {
      const summary = [];
      for (let i = 0; i < orgsCount; i++) {
        summary.push(
          await seedOrg(prisma, rng, {
            orgIndex: i,
            usersPerOrg,
            propsPerOrg,
            issuesPerOrg,
            writeOffsPerOrg,
            mediaPerOrg,
            auditPerOrg,
            monthsBack,
          })
        );
      }
      console.table(summary);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});