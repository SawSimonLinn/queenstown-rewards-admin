"use client";

import { useActionState } from "react";

import { createStaffAccount, type StaffFormState } from "@/app/dashboard/staff/actions";
import { Card, ErrorBanner } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";

export function StaffForm({ locations }: { locations: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState<StaffFormState, FormData>(createStaffAccount, null);
  const formRef = useUnsavedChangesWarning<HTMLFormElement>();

  return (
    <Card className="w-full max-w-xl">
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <ErrorBanner message={state?.error} />

        <Field label="Full name" htmlFor="full_name" required>
          <Input id="full_name" name="full_name" required />
        </Field>

        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required />
        </Field>

        <Field label="Temporary password" htmlFor="password" required hint="At least 8 characters. Share this with the new staff member securely.">
          <Input id="password" name="password" type="password" minLength={8} required />
        </Field>

        <Field label="Role" htmlFor="role" required>
          <Select id="role" name="role" defaultValue="staff" required>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>

        <Field label="Location" htmlFor="location_id" required>
          <Select id="location_id" name="location_id" required defaultValue="">
            <option value="" disabled>
              Select a location
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <SubmitButton>Create account</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
