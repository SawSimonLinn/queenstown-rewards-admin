"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

export function SubmitButton({
  children,
  pendingLabel,
  variant,
  size,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "outline" | "danger";
  size?: "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const label = pending ? (pendingLabel ?? "Saving...") : children;

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      variant={variant}
      size={size}
      className={`w-full sm:w-auto ${className}`}
    >
      {pending ? <Spinner /> : null}
      <span aria-live="polite">{label}</span>
    </Button>
  );
}
