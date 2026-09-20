"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordInputProps = {
  autoComplete: string;
  id: string;
  name: string;
  required?: boolean;
};

export function PasswordInput({
  autoComplete,
  id,
  name,
  required,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        autoComplete={autoComplete}
        className="pr-10"
        id={id}
        minLength={8}
        name={name}
        required={required}
        type={visible ? "text" : "password"}
      />
      <Button
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-0 top-0"
        onClick={() => setVisible((current) => !current)}
        size="icon"
        title={visible ? "Hide password" : "Show password"}
        type="button"
        variant="ghost"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}
