import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { jsonError, readJsonObject, requiredString } from "@/lib/api";
import { createAdminSession, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const email = requiredString(body?.email)?.toLowerCase() ?? "";
  const password = requiredString(body?.password) ?? "";
  const confirmPassword = requiredString(body?.confirmPassword) ?? "";

  if (!isValidEmail(email)) {
    return jsonError("Enter a valid email address.");
  }

  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    return jsonError("Passwords do not match.");
  }

  const db = getDb();

  try {
    const [admin] = await db
      .insert(admins)
      .values({
        email,
        passwordHash: await hashPassword(password),
      })
      .returning({ email: admins.email, id: admins.id });

    await createAdminSession(admin.id);

    return Response.json({ admin }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return jsonError("That email is already registered.");
    }

    console.error("Admin registration failed:", error);

    return jsonError("Unable to create the admin account.", 500);
  }
}
