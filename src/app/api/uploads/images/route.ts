import { randomUUID } from "crypto";

import { jsonError, readJsonObject, requiredString } from "@/lib/api";
import { getAdminSession } from "@/lib/auth";
import { createImageUploadUrl } from "@/lib/r2";

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

  const body = await readJsonObject(request);
  const fileName = requiredString(body?.fileName ?? body?.file_name);
  const contentType = requiredString(body?.contentType ?? body?.content_type);

  if (!fileName) {
    return jsonError("File name is required.");
  }

  if (!contentType || !imageContentTypes.has(contentType)) {
    return jsonError("A supported image content type is required.");
  }

  try {
    const extension = getExtension(fileName, contentType);
    const key = `infinite-images/${randomUUID()}.${extension}`;
    const upload = await createImageUploadUrl({ contentType, key });

    return Response.json(upload, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create upload URL.";

    return jsonError(message, 500);
  }
}
