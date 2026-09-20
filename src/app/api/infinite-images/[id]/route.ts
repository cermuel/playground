import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { infiniteImages, locations } from "@/db/schema";
import {
  jsonError,
  optionalString,
  readJsonObject,
  requiredString,
} from "@/lib/api";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

type ImageContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ImageContext) {
  const { id } = await params;
  const db = getDb();
  const image = await db.query.infiniteImages.findFirst({
    where: and(eq(infiniteImages.id, id), isNull(infiniteImages.deletedAt)),
    with: {
      location: true,
    },
  });

  if (!image) {
    return jsonError("Image not found.", 404);
  }

  return Response.json({ image });
}

export async function PATCH(request: Request, { params }: ImageContext) {
  const session = await getAdminSession();

  if (!session) {
    return jsonError("Unauthorized.", 401);
  }

  const { id } = await params;
  const body = await readJsonObject(request);
  const db = getDb();
  const updates: {
    description?: string | null;
    imageUrl?: string;
    locationId?: string | null;
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  if (
    body?.imageUrl !== undefined ||
    body?.image_url !== undefined
  ) {
    const imageUrl = requiredString(body.imageUrl ?? body.image_url);

    if (!imageUrl) {
      return jsonError("Image URL cannot be empty.");
    }

    updates.imageUrl = imageUrl;
  }

  if (body?.locationId !== undefined || body?.location_id !== undefined) {
    const locationId = optionalString(body.locationId ?? body.location_id);

    if (locationId) {
      const [location] = await db
        .select({ id: locations.id })
        .from(locations)
        .where(and(eq(locations.id, locationId), isNull(locations.deletedAt)))
        .limit(1);

      if (!location) {
        return jsonError("Location not found.", 404);
      }
    }

    updates.locationId = locationId;
  }

  if (body?.description !== undefined) {
    updates.description = optionalString(body.description);
  }

  const [image] = await db
    .update(infiniteImages)
    .set(updates)
    .where(and(eq(infiniteImages.id, id), isNull(infiniteImages.deletedAt)))
    .returning();

  if (!image) {
    return jsonError("Image not found.", 404);
  }

  return Response.json({ image });
}

export async function DELETE(_request: Request, { params }: ImageContext) {
  const session = await getAdminSession();

  if (!session) {
    return jsonError("Unauthorized.", 401);
  }

  const { id } = await params;
  const db = getDb();
  const now = new Date();
  const [image] = await db
    .update(infiniteImages)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(and(eq(infiniteImages.id, id), isNull(infiniteImages.deletedAt)))
    .returning();

  if (!image) {
    return jsonError("Image not found.", 404);
  }

  return Response.json({ image });
}
