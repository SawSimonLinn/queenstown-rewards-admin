"use client";

import { useActionState } from "react";

import { createStaffAccount, type StaffFormState } from "@/app/dashboard/staff/actions";
import { Card, ErrorBanner } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function StaffForm({ locations }: { locations: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState<StaffFormState, FormData>(createStaffAccount, null);

  return (
    <Card className="w-full max-w-xl">
      <form action={formAction} className="flex flex-col gap-4">
        <ErrorBanner message={state?.error} />

        <Field label="Full name" htmlFor="full_name">
          <Input id="full_name" name="full_name" required />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required />
        </Field>

        <Field label="Temporary password" htmlFor="password">
          <Input id="password" name="password" type="password" minLength={8} required />
        </Field>

        <Field label="Role" htmlFor="role">
          <Select id="role" name="role" defaultValue="staff" required>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>

        <Field label="Location" htmlFor="location_id">
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
