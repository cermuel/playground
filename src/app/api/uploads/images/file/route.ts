import { randomUUID } from "crypto";

import { jsonError } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { uploadImage } from "@/lib/r2";

export const runtime = "nodejs";

const imageContentTypes = new Set([
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getExtension(fileName: string, contentType: string) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  if (fileExtension && /^[a-z0-9]+$/.test(fileExtension)) {
    return fileExtension;
  }

  return contentType.split("/")[1] ?? "bin";
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return jsonError("Unauthorized.", 401);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("An image file is required.");
  }

  if (!imageContentTypes.has(file.type)) {
    return jsonError("A supported image content type is required.");
  }

  try {
    const key = `infinite-images/${randomUUID()}.${getExtension(file.name, file.type)}`;
    const upload = await uploadImage({
      body: new Uint8Array(await file.arrayBuffer()),
      contentType: file.type,
      key,
    });

    return Response.json(upload, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload image.";

    return jsonError(message, 500);
  }
}
