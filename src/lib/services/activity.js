export async function logActivity(tx, { orgId, actorUserId, action, entityType, entityId, meta }) {
  return tx.auditLog.create({
    data: {
      orgId,
      actorUserId,
      action,
      entityType,
      entityId,
      meta: meta || undefined,
    },
  });
}
