"use client";

import { useActionState } from "react";

import { OpeningHoursFields } from "@/components/opening-hours-fields";
import { Card, ErrorBanner } from "@/components/ui/card";
import { checkboxClass, checkboxLabelClass, Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { OpeningHours } from "@/lib/opening-hours";

import type { LocationFormState } from "./actions";

type LocationRecord = {
  name: string;
  address: string;
  suburb: string;
  phone: string;
  latitude: number;
  longitude: number;
  is_participating: boolean;
  opening_hours: OpeningHours;
};

export function LocationForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: LocationFormState, formData: FormData) => Promise<LocationFormState>;
  initial?: LocationRecord;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<LocationFormState, FormData>(action, null);

  return (
    <Card className="w-full max-w-3xl">
      <form action={formAction} className="flex flex-col gap-4">
        <ErrorBanner message={state?.error} />

        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={initial?.name} required />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Address" htmlFor="address">
            <Input id="address" name="address" defaultValue={initial?.address} required />
          </Field>
          <Field label="Suburb" htmlFor="suburb">
            <Input
              id="suburb"
              name="suburb"
              defaultValue={initial?.suburb ?? "Queenstown"}
              required
            />
          </Field>
        </div>

        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={initial?.phone} required />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Latitude" htmlFor="latitude">
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              defaultValue={initial?.latitude}
              required
            />
          </Field>
          <Field label="Longitude" htmlFor="longitude">
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              defaultValue={initial?.longitude}
              required
            />
          </Field>
        </div>

        <OpeningHoursFields initial={initial?.opening_hours} />

        <label className={checkboxLabelClass}>
          <input
            type="checkbox"
            name="is_participating"
            defaultChecked={initial?.is_participating ?? true}
            className={checkboxClass}
          />
          <span>Participating in Queenstown Rewards</span>
        </label>

        <div>
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
