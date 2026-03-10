import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export async function GET() {
  try {
    const result = await prisma.org.count();
    return ok({ orgCount: result });
  } catch {
    return fail("database unavailable", 500);
  }
}