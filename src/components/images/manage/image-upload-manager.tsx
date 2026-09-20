"use client";

import axios from "axios";
import { ImagePlus, Loader2, Plus, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocationOption = {
  id: string;
  name: string;
};

type ImageUploadManagerProps = {
  locations: LocationOption[];
};

type UploadState =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; count: number };

type ApiErrorResponse = {
  error?: string;
};

type UploadUrlResponse = {
  publicUrl: string | null;
};

type CreateLocationResponse = {
  location: LocationOption;
};

function getApiError(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return null;
}

function getUploadError(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      getApiError(error.response?.data) ??
      error.message ??
      "Something went wrong."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Upload failed.";
}

export function ImageUploadManager({ locations }: ImageUploadManagerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [locationId, setLocationId] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [state, setState] = useState<UploadState>({ kind: "idle" });

  const selectedFileNames = useMemo(() => {
    return files.map((file) => file.name).join(", ");
  }, [files]);

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
    setState({ kind: "idle" });
  }

  async function createLocationIfNeeded() {
    if (locationId !== "__new__") {
      return locationId || null;
    }

    const name = newLocationName.trim();

    if (!name) {
      throw new Error("Enter a name for the new location.");
    }

    const { data } = await axios.post<CreateLocationResponse>(
      "/api/locations",
      { name },
    );

    return data.location.id;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!files.length) {
      setState({ kind: "error", message: "Choose at least one image." });
      return;
    }

    setUploading(true);
    setState({ kind: "idle" });

    try {
      const resolvedLocationId = await createLocationIfNeeded();

      for (const [index, file] of files.entries()) {
        setProgress(`Uploading ${index + 1} of ${files.length}`);

        const formData = new FormData();
        formData.append("file", file);

        const { data: upload } = await axios.post<UploadUrlResponse>(
          "/api/uploads/images/file",
          formData,
        );

        if (!upload.publicUrl) {
          throw new Error("R2 public base URL is not configured.");
        }

        await axios.post("/api/infinite-images", {
          imageUrl: upload.publicUrl,
          locationId: resolvedLocationId,
        });
      }

      setFiles([]);
      setNewLocationName("");
      setLocationId("");
      setProgress("");
      setState({ kind: "success", count: files.length });
      form.reset();
    } catch (error) {
      setState({
        kind: "error",
        message: getUploadError(error),
      });
    } finally {
      setUploading(false);
      setProgress("");
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="size-5" />
          Upload images
        </CardTitle>
        <CardDescription>
          Pick one or more images to add to the gallery.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {state.kind === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          {state.kind === "success" ? (
            <Alert>
              <AlertTitle>Upload complete</AlertTitle>
              <AlertDescription>
                Added {state.count} image{state.count === 1 ? "" : "s"}.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="images">Images</Label>
            <Input
              accept="image/avif,image/gif,image/heic,image/heif,image/jpeg,image/png,image/webp"
              disabled={uploading}
              id="images"
              multiple
              onChange={handleFilesChange}
              required
              type="file"
            />
            {selectedFileNames ? (
              <p className="text-sm text-muted-foreground">
                {selectedFileNames}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="location">Location</Label>
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
              disabled={uploading}
              id="location"
              onChange={(event) => setLocationId(event.target.value)}
              value={locationId}
            >
              <option value="">No location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
              <option value="__new__">Create new location</option>
            </select>
          </div>

          {locationId === "__new__" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="new-location">New location</Label>
              <Input
                disabled={uploading}
                id="new-location"
                onChange={(event) => setNewLocationName(event.target.value)}
                placeholder="e.g. Tokyo"
                required
                value={newLocationName}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={uploading} type="submit">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? progress || "Uploading..." : "Upload"}
            </Button>
            {locationId === "__new__" ? (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Plus className="size-4" />
                Location will be created with the upload.
              </span>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
