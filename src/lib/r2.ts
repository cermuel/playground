import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucket = process.env.CLOUDFLARE_R2_BUCKET;
const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;

export function getR2Bucket() {
  if (!bucket) {
    throw new Error("CLOUDFLARE_R2_BUCKET is required.");
  }

  return bucket;
}

export function getR2PublicUrl(key: string) {
  if (!publicBaseUrl) {
    return null;
  }

  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

export function getR2Client() {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 credentials are required to create upload URLs.",
    );
  }

  return new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  });
}

export async function createImageUploadUrl(input: {
  contentType: string;
  key: string;
}) {
  const command = new PutObjectCommand({
    Bucket: getR2Bucket(),
    ContentType: input.contentType,
    Key: input.key,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, {
    expiresIn: 60 * 5,
  });

  return {
    key: input.key,
    publicUrl: getR2PublicUrl(input.key),
    uploadUrl,
  };
}

export async function uploadImage(input: {
  body: Uint8Array;
  contentType: string;
  key: string;
}) {
  const isHeic =
    input.contentType === "image/heic" || input.contentType === "image/heif";
  const body = isHeic
    ? await sharp(input.body).jpeg({ quality: 90 }).toBuffer()
    : input.body;
  const key = isHeic
    ? input.key.replace(/\.(?:heic|heif)$/i, ".jpg")
    : input.key;

  await getR2Client().send(
    new PutObjectCommand({
      Body: body,
      Bucket: getR2Bucket(),
      ContentType: isHeic ? "image/jpeg" : input.contentType,
      Key: key,
    }),
  );

  return {
    key,
    publicUrl: getR2PublicUrl(key),
  };
}
