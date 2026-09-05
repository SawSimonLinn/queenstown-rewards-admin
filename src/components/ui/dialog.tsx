"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button, buttonClassName } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";

export function Dialog({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className={`w-full max-w-md rounded-xl border border-border bg-surface p-0 shadow-lg backdrop:bg-ink/40 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-cream hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          ✕
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "primary",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  variant?: "primary" | "danger";
  onConfirm: () => Promise<void> | void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title={title}>
      <div className="flex flex-col gap-4">
        <div className="text-sm text-muted">{description}</div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={buttonClassName({ variant: "outline" })}
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/** Trigger button + confirm dialog bundled together for the common case. */
export function ConfirmButton({
  label,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "primary",
  triggerVariant = "outline",
  triggerSize = "sm",
  onConfirm,
  className = "",
}: {
  label: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  variant?: "primary" | "danger";
  triggerVariant?: "primary" | "outline" | "ghost" | "danger";
  triggerSize?: "sm" | "md";
  onConfirm: () => Promise<void> | void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={buttonClassName({ variant: triggerVariant, size: triggerSize, className })}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        variant={variant}
        onConfirm={onConfirm}
      />
    </>
  );
}
