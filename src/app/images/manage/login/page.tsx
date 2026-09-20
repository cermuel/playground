import { redirect } from "next/navigation";

import { AuthForm } from "@/components/images/manage/auth-form";
import { getAdminSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/images/manage");
  }

  return (
    <main className="grid h-svh place-items-center overflow-auto px-4 py-8">
      <AuthForm
        alternateHref="/images/manage/register"
        alternateLabel="Create an admin account"
        apiPath="/api/admin/login"
        submitLabel="Log in"
        subtitle="Sign in before managing the gallery."
        title="Image manager"
        variant="login"
      />
    </main>
  );
}
