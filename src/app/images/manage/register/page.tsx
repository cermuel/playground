import { redirect } from "next/navigation";

import { AuthForm } from "@/components/images/manage/auth-form";
import { getAdminSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/images/manage");
  }

  return (
    <main className="grid h-svh place-items-center overflow-auto px-4 py-8">
      <AuthForm
        alternateHref="/images/manage/login"
        alternateLabel="Already have an account?"
        apiPath="/api/admin/register"
        submitLabel="Create account"
        subtitle="Create the admin user for gallery uploads."
        title="Register admin"
        variant="register"
      />
    </main>
  );
}
