import { asc, isNull } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { getDb } from "@/db";
import { locations } from "@/db/schema";
import {
  jsonError,
  optionalString,
  readJsonObject,
  requiredString,
} from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const includeDeleted =
    request.nextUrl.searchParams.get("includeDeleted") === "true";
  const db = getDb();

  const rows = await db
    .select()
    .from(locations)
    .where(includeDeleted ? undefined : isNull(locations.deletedAt))
    .orderBy(asc(locations.name));

  return Response.json({ locations: rows });
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return jsonError("Unauthorized.", 401);
  }

  const body = await readJsonObject(request);
  const name = requiredString(body?.name);

  if (!name) {
    return jsonError("Location name is required.");
  }

  const db = getDb();

  const [location] = await db
    .insert(locations)
    .values({
      description: optionalString(body?.description),
      name,
    })
    .returning();

  return Response.json({ location }, { status: 201 });
}
