export type ApiError = {
  error: string;
};

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message } satisfies ApiError, { status });
}

export async function readJsonObject(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function requiredString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
