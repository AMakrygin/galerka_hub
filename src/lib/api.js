const DEFAULT_ORG_ID = "org_demo";

export function getOrgId() {
  return (process.env.ORG_ID || DEFAULT_ORG_ID).trim();
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
