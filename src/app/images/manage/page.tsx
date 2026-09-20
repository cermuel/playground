import { asc, isNull } from "drizzle-orm";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { logoutAdmin } from "@/app/images/manage/actions";
import { ImageUploadManager } from "@/components/images/manage/image-upload-manager";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db";
import { locations } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";

export default async function ManageImagesPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/images/manage/login");
  }

  const db = getDb();
  const locationRows = await db
    .select({
      id: locations.id,
      name: locations.name,
    })
    .from(locations)
    .where(isNull(locations.deletedAt))
    .orderBy(asc(locations.name));

  return (
    <main className="grid min-h-svh place-items-center overflow-auto px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <header className="flex items-start justify-between gap-4 px-1">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Image manager</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as {session.email}
            </p>
          </div>

          <form action={logoutAdmin}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" />
              Log out
            </Button>
          </form>
        </header>

        <ImageUploadManager locations={locationRows} />
      </div>
    </main>
  );
}
