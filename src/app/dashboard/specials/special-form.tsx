"use client";

import { useActionState } from "react";

import { Card, ErrorBanner } from "@/components/ui/card";
import {
  checkboxClass,
  checkboxLabelClass,
  Field,
  fileInputClass,
  Input,
  Textarea,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

import type { SpecialFormState } from "./actions";

type SpecialRecord = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
};

export function SpecialForm({
  action,
  initial,
  locations,
  initialLocationIds,
  submitLabel,
}: {
  action: (state: SpecialFormState, formData: FormData) => Promise<SpecialFormState>;
  initial?: SpecialRecord;
  locations: { id: string; name: string }[];
  initialLocationIds?: string[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<SpecialFormState, FormData>(action, null);
  const selected = new Set(initialLocationIds ?? []);

  return (
    <Card className="w-full max-w-3xl">
      <form action={formAction} className="flex flex-col gap-4">
        <ErrorBanner message={state?.error} />

        <Field label="Title" htmlFor="title">
          <Input id="title" name="title" defaultValue={initial?.title} required />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initial?.description}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="start_date">
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={initial?.start_date?.slice(0, 10)}
              required
            />
          </Field>
          <Field label="End date" htmlFor="end_date">
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={initial?.end_date?.slice(0, 10)}
              required
            />
          </Field>
        </div>

        <Field label="Image" htmlFor="image">
          <input id="image" name="image" type="file" accept="image/*" className={fileInputClass} />
          {initial?.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={initial.image_url}
              alt=""
              className="mt-2 h-24 w-full max-w-xs rounded-md object-cover"
            />
          )}
        </Field>

        <div>
          <p className="mb-1 text-sm font-medium text-neutral-700">
            Locations (leave blank for all locations)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {locations.map((location) => (
              <label key={location.id} className={checkboxLabelClass}>
                <input
                  type="checkbox"
                  name="location_ids"
                  value={location.id}
                  defaultChecked={selected.has(location.id)}
                  className={checkboxClass}
                />
                <span className="min-w-0 break-words">{location.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
