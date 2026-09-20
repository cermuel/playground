import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { locations } from "@/db/schema";
import {
  jsonError,
  optionalString,
  readJsonObject,
  requiredString,
} from "@/lib/api";

export const runtime = "nodejs";

type LocationContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: LocationContext) {
  const { id } = await params;
  const db = getDb();
  const [location] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.id, id), isNull(locations.deletedAt)))
    .limit(1);

  if (!location) {
    return jsonError("Location not found.", 404);
  }

  return Response.json({ location });
}

export async function PATCH(request: Request, { params }: LocationContext) {
  const { id } = await params;
  const body = await readJsonObject(request);
  const db = getDb();
  const updates: {
    description?: string | null;
    name?: string;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (body?.name !== undefined) {
    const name = requiredString(body.name);

    if (!name) {
      return jsonError("Location name cannot be empty.");
    }

    updates.name = name;
  }

  if (body?.description !== undefined) {
    updates.description = optionalString(body.description);
  }

  const [location] = await db
    .update(locations)
    .set(updates)
    .where(and(eq(locations.id, id), isNull(locations.deletedAt)))
    .returning();

  if (!location) {
    return jsonError("Location not found.", 404);
  }

  return Response.json({ location });
}

export async function DELETE(_request: Request, { params }: LocationContext) {
  const { id } = await params;
  const db = getDb();
  const now = new Date();
  const [location] = await db
    .update(locations)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(and(eq(locations.id, id), isNull(locations.deletedAt)))
    .returning();

  if (!location) {
    return jsonError("Location not found.", 404);
  }

  return Response.json({ location });
}
