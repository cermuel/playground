"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PasswordInput } from "@/components/images/manage/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  alternateHref: string;
  alternateLabel: string;
  apiPath: string;
  submitLabel: string;
  subtitle: string;
  title: string;
  variant: "login" | "register";
};

export function AuthForm({
  alternateHref,
  alternateLabel,
  apiPath,
  submitLabel,
  subtitle,
  title,
  variant,
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      await axios.post(apiPath, payload);
      router.push("/images/manage");
      router.refresh();
    } catch (error) {
      if (
        axios.isAxiosError<{ error?: string }>(error) &&
        error.response?.data?.error
      ) {
        setError(error.response.data.error);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              autoComplete={
                variant === "register" ? "new-password" : "current-password"
              }
              id="password"
              name="password"
              required
            />
          </div>

          {variant === "register" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <PasswordInput
                autoComplete="new-password"
                id="confirm-password"
                name="confirmPassword"
                required
              />
            </div>
          ) : null}

          <Button disabled={pending} type="submit">
            {pending ? "Working..." : submitLabel}
          </Button>

          <Link
            className={buttonVariants({ variant: "link" })}
            href={alternateHref}
          >
            {alternateLabel}
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
