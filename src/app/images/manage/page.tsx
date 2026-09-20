import { asc, desc, isNull } from "drizzle-orm";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { logoutAdmin } from "@/app/images/manage/actions";
import { ImageUploadManager } from "@/components/images/manage/image-upload-manager";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db";
import { infiniteImages, locations } from "@/db/schema";
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
  const imageRows = await db.query.infiniteImages.findMany({
    orderBy: [desc(infiniteImages.createdAt)],
    where: isNull(infiniteImages.deletedAt),
    with: {
      location: true,
    },
  });
  const imageItems = imageRows.map((image) => ({
    createdAt: image.createdAt.toISOString(),
    description: image.description,
    id: image.id,
    imageUrl: /\.(?:heic|heif)(?:[?#].*)?$/i.test(image.imageUrl)
      ? `/api/infinite-images/${image.id}/image`
      : image.imageUrl,
    location: image.location ? { name: image.location.name } : null,
  }));

  return (
    <main className="min-h-svh w-full overflow-y-auto px-4 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <header className="flex items-start justify-between gap-4 px-1">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Image manager
            </h1>
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

        <ImageUploadManager
          initialImages={imageItems}
          locations={locationRows}
        />
      </div>
    </main>
  );
}
