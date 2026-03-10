const DEFAULT_ORG_ID = "org_demo";

export function getOrgId(req) {
  const headerOrgId =
    req?.headers?.get?.("x-org-id") ||
    req?.headers?.get?.("x-org_id") ||
    req?.headers?.get?.("x-orgid") ||
    req?.headers?.get?.("org-id") ||
    req?.headers?.get?.("org_id");

  return (headerOrgId || process.env.ORG_ID || DEFAULT_ORG_ID).trim();
}

export function getFrontendOrigin() {
  return (process.env.FRONTEND_ORIGIN || "*").trim();
}

export function ok(data, status = 200) {
  return Response.json({ ok: true, data }, { status });
}

export function fail(message, status = 400, details = undefined) {
  return Response.json(
    {
      ok: false,
      error: {
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export async function parseJsonSafe(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
