import { and, eq, isNull } from "drizzle-orm";
import sharp from "sharp";

import { getDb } from "@/db";
import { infiniteImages } from "@/db/schema";
import { jsonError } from "@/lib/api";

export const runtime = "nodejs";

type ImageContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ImageContext) {
  const { id } = await params;
  const db = getDb();
  const image = await db.query.infiniteImages.findFirst({
    columns: { imageUrl: true },
    where: and(eq(infiniteImages.id, id), isNull(infiniteImages.deletedAt)),
  });

  if (!image) {
    return jsonError("Image not found.", 404);
  }

  const source = await fetch(image.imageUrl);

  if (!source.ok) {
    return new Response("Unable to fetch image.", { status: 502 });
  }

  const converted = await sharp(Buffer.from(await source.arrayBuffer()))
    .jpeg({ quality: 90 })
    .toBuffer();

  return new Response(converted, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/jpeg",
    },
  });
}
