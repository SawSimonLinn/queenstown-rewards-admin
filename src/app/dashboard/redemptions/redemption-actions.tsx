"use client";

import { useState, useTransition } from "react";

import { Button, buttonClassName } from "@/components/ui/button";
import { ConfirmButton, Dialog } from "@/components/ui/dialog";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/loading";
import { useToast } from "@/components/ui/toast";

import { cancelRedemption, confirmRedemption, correctRedemption } from "./actions";

export function RedemptionActions({
  redemptionId,
  status,
}: {
  redemptionId: string;
  status: string;
}) {
  const { showToast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [correctOpen, setCorrectOpen] = useState(false);

  if (status === "pending_staff_confirmation") {
    return (
      <div className="flex flex-wrap gap-2">
        <ConfirmButton
          label="Confirm"
          triggerVariant="primary"
          title="Confirm redemption"
          description="This marks the redemption as confirmed and records you as the confirming staff member."
          confirmLabel="Confirm redemption"
          onConfirm={async () => {
            const result = await confirmRedemption(redemptionId);
            if (result.error) throw new Error(result.error);
            showToast("Redemption confirmed.", "success");
          }}
        />
        <button
          type="button"
          className={buttonClassName({ variant: "outline" })}
          onClick={() => setCancelOpen(true)}
        >
          Cancel
        </button>
        <CancelDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          redemptionId={redemptionId}
        />
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <>
        <button
          type="button"
          className={buttonClassName({ variant: "outline" })}
          onClick={() => setCorrectOpen(true)}
        >
          Correct
        </button>
        <CorrectDialog open={correctOpen} onOpenChange={setCorrectOpen} redemptionId={redemptionId} />
      </>
    );
  }

  return <span className="text-xs text-muted">No actions available</span>;
}

function CancelDialog({
  open,
  onOpenChange,
  redemptionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redemptionId: string;
}) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await cancelRedemption(redemptionId, reason);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Redemption cancelled.", "success");
      setReason("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title="Cancel redemption">
      <div className="flex flex-col gap-4">
        <Field label="Reason" htmlFor="cancel-reason" required>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Why is this redemption being cancelled?"
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={buttonClassName({ variant: "outline" })}
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Back
          </button>
          <Button type="button" variant="danger" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner className="size-4" /> : null}
            Cancel redemption
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function CorrectDialog({
  open,
  onOpenChange,
  redemptionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redemptionId: string;
}) {
  const { showToast } = useToast();
  const [newStatus, setNewStatus] = useState<"confirmed" | "cancelled">("cancelled");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await correctRedemption(redemptionId, newStatus, note);
      if (result.error) {
        setError(result.error);
        return;
      }
      showToast("Redemption corrected.", "success");
      setNote("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} title="Correct redemption">
      <div className="flex flex-col gap-4">
        <Field label="Correct status to" htmlFor="correct-status" required>
          <Select
            id="correct-status"
            value={newStatus}
            onChange={(event) => setNewStatus(event.target.value as "confirmed" | "cancelled")}
          >
            <option value="cancelled">Cancelled</option>
            <option value="confirmed">Confirmed</option>
          </Select>
        </Field>
        <Field label="Note" htmlFor="correct-note" required>
          <Textarea
            id="correct-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Explain why this confirmed redemption is being corrected"
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={buttonClassName({ variant: "outline" })}
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Back
          </button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Spinner className="size-4" /> : null}
            Save correction
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
