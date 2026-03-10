const PROP_STATUS_TO_API = {
  IN_STORAGE: "available",
  ISSUED: "in-use",
  DAMAGED: "damaged",
  MISSING: "missing",
  WRITTEN_OFF: "missing",
};

const API_STATUS_TO_PROP = {
  available: "IN_STORAGE",
  "in-use": "ISSUED",
  damaged: "DAMAGED",
  missing: "MISSING",
  IN_STORAGE: "IN_STORAGE",
  ISSUED: "ISSUED",
  DAMAGED: "DAMAGED",
  MISSING: "MISSING",
  WRITTEN_OFF: "WRITTEN_OFF",
};

export function toApiPropStatus(status) {
  return PROP_STATUS_TO_API[status] || "available";
}

export function toDbPropStatus(status) {
  return API_STATUS_TO_PROP[status] || null;
}

export function assignmentStatus(issue) {
  if (issue.status === "CLOSED") return "returned";
  if (issue.expectedReturnAt && issue.expectedReturnAt < new Date()) return "overdue";
  return "issued";
}

export function toIsoDate(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

export function mapContainer(container) {
  return {
    id: container.id,
    name: container.name,
    location: container.location || container.parent?.name || container.warehouse?.name || "",
    parentId: container.parentId,
    type: (container.type || "CONTAINER").toLowerCase(),
    capacity: container.capacity || 0,
    propsCount: typeof container._count?.props === "number" ? container._count.props : (container.props?.length || 0),
  };
}

export function mapProp(prop) {
  const containerPath = [
    prop.currentContainer?.warehouse?.name,
    prop.currentContainer?.parent?.name,
    prop.currentContainer?.name,
  ].filter(Boolean).join(" > ");

  return {
    id: prop.id,
    name: prop.name,
    category: prop.category || "",
    photo: prop.photoUrl || "",
    container: prop.currentContainer?.name || "",
    containerLocation: containerPath,
    assignedActor: prop.issues?.[0]?.actor?.name || null,
    status: toApiPropStatus(prop.status),
    description: prop.description || "",
    qrCode: prop.qrCode || prop.inventoryNumber || "",
  };
}

export function mapActor(actor) {
  return {
    id: actor.id,
    name: actor.name,
    role: actor.title || actor.role,
    photo: actor.photoUrl || "",
    assignedProps: typeof actor._count?.actorIssues === "number" ? actor._count.actorIssues : 0,
    performances: actor.performances || [],
  };
}

export function mapAssignment(issue) {
  return {
    id: issue.id,
    propId: issue.propId,
    propName: issue.prop?.name || "",
    actorId: issue.actorUserId,
    actorName: issue.actor?.name || "",
    performance: issue.performance || "",
    dateIssued: toIsoDate(issue.issuedAt),
    returnDate: toIsoDate(issue.returnedAt),
    status: assignmentStatus(issue),
  };
}

export function mapWriteOff(writeOff) {
  return {
    id: writeOff.id,
    propId: writeOff.propId,
    propName: writeOff.prop?.name || "",
    reason: writeOff.reason || writeOff.comment || "",
    date: toIsoDate(writeOff.writtenOffAt),
    approvedBy: writeOff.approvedByName || writeOff.writtenOffBy?.name || "",
    photo: writeOff.photoUrl || "",
  };
}

export function mapActivity(activity) {
  return {
    id: activity.id,
    type: (activity.meta?.type || String(activity.action || "").toLowerCase()) || "prop_added",
    description: activity.meta?.description || activity.action,
    timestamp: activity.createdAt.toISOString(),
    user: activity.actor?.name || "",
  };
}
