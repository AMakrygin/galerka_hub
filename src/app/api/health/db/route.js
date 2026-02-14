import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await prisma.org.count();
  return Response.json({ ok: true, orgCount: result });
}