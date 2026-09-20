"use server";

import { redirect } from "next/navigation";

import { clearAdminSession, requireAdminSession } from "@/lib/auth";

export async function logoutAdmin() {
  await requireAdminSession();
  await clearAdminSession();
  redirect("/images/manage/login");
}
