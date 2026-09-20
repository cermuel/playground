import { and, desc, eq, isNull } from "drizzle-orm";
import type { NextRequest } from "next/server";

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

export async function GET(request: NextRequest) {
  const includeDeleted =
    request.nextUrl.searchParams.get("includeDeleted") === "true";
  const db = getDb();

  const rows = await db.query.infiniteImages.findMany({
    orderBy: [desc(infiniteImages.createdAt)],
    where: includeDeleted ? undefined : isNull(infiniteImages.deletedAt),
    with: {
      location: true,
    },
  });

  return Response.json({
    images: rows.map((row) => ({
      ...row,
      imageUrl: /\.(?:heic|heif)(?:[?#].*)?$/i.test(row.imageUrl)
        ? `/api/infinite-images/${row.id}/image`
        : row.imageUrl,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return jsonError("Unauthorized.", 401);
  }

  const body = await readJsonObject(request);
  const imageUrl = requiredString(body?.imageUrl ?? body?.image_url);

  if (!imageUrl) {
    return jsonError("Image URL is required.");
  }

  const locationId = optionalString(body?.locationId ?? body?.location_id);
  const db = getDb();

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

  const [image] = await db
    .insert(infiniteImages)
    .values({
      description: optionalString(body?.description),
      imageUrl,
      locationId,
    })
    .returning();

  return Response.json({ image }, { status: 201 });
}
