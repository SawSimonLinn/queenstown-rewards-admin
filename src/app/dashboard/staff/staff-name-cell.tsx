"use client";

import { useState, useTransition } from "react";

import { updateStaffName } from "@/app/dashboard/staff/actions";
import { inputClass } from "@/components/ui/field";

export function StaffNameCell({
  profileId,
  fullName,
}: {
  profileId: string;
  fullName: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fullName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="truncate">{fullName ?? "—"}</span>
        <button
          type="button"
          onClick={() => {
            setValue(fullName ?? "");
            setError(null);
            setEditing(true);
          }}
          className="shrink-0 text-xs font-medium text-blue-700 hover:underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await updateStaffName(profileId, value);
          if (result?.error) {
            setError(result.error);
            return;
          }
          setError(null);
          setEditing(false);
        });
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={`${inputClass} h-8 min-w-0 py-1`}
        autoFocus
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 text-xs font-medium text-blue-700 hover:underline disabled:opacity-60"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        disabled={isPending}
        className="shrink-0 text-xs font-medium text-neutral-500 hover:underline"
      >
        Cancel
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </form>
  );
}
