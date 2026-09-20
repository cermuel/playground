import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { jsonError, readJsonObject, requiredString } from "@/lib/api";
import { createAdminSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const email = requiredString(body?.email)?.toLowerCase() ?? "";
  const password = requiredString(body?.password) ?? "";

  if (!email || !password) {
    return jsonError("Enter your email and password.");
  }

  const db = getDb();
  const [admin] = await db
    .select({
      email: admins.email,
      id: admins.id,
      passwordHash: admins.passwordHash,
    })
    .from(admins)
    .where(and(eq(admins.email, email), isNull(admins.deletedAt)))
    .limit(1);

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return jsonError("Email or password is incorrect.", 401);
  }

  await createAdminSession(admin.id);

  return Response.json({
    admin: {
      email: admin.email,
      id: admin.id,
    },
  });
}
