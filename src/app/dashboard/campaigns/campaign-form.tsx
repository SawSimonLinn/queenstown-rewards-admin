"use client";

import { useActionState } from "react";

import { Card, ErrorBanner } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { LocationMultiSelect } from "@/components/ui/multi-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";

import type { CampaignFormState } from "./actions";

type CampaignRecord = {
  name: string;
  description: string;
  terms_and_restrictions: string;
  start_date: string;
  end_date: string;
  status: string;
  image_url: string | null;
};

export function CampaignForm({
  action,
  initial,
  locations,
  initialLocationIds,
  submitLabel,
}: {
  action: (state: CampaignFormState, formData: FormData) => Promise<CampaignFormState>;
  initial?: CampaignRecord;
  locations: { id: string; name: string }[];
  initialLocationIds?: string[];
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<CampaignFormState, FormData>(action, null);
  const formRef = useUnsavedChangesWarning<HTMLFormElement>();

  return (
    <Card className="w-full max-w-3xl">
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <ErrorBanner message={state?.error} />

        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={initial?.name} required />
        </Field>

        <Field label="Description" htmlFor="description" required>
          <Textarea id="description" name="description" rows={3} defaultValue={initial?.description} required />
        </Field>

        <Field
          label="Terms and restrictions"
          htmlFor="terms_and_restrictions"
          hint="Optional — shown to customers in the mobile app."
        >
          <Textarea id="terms_and_restrictions" name="terms_and_restrictions" rows={2} defaultValue={initial?.terms_and_restrictions} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="start_date" required>
            <Input id="start_date" name="start_date" type="date" defaultValue={initial?.start_date?.slice(0, 10)} required />
          </Field>
          <Field label="End date" htmlFor="end_date" required>
            <Input id="end_date" name="end_date" type="date" defaultValue={initial?.end_date?.slice(0, 10)} required />
          </Field>
        </div>

        <Field label="Status" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={initial?.status ?? "draft"} required>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </Select>
        </Field>

        <Field label="Image" htmlFor="image" hint="Shown as the campaign's hero image in the mobile app.">
          <ImageUploadField id="image" name="image" existingImageUrl={initial?.image_url} />
        </Field>

        <Field label="Participating locations" htmlFor="location_ids">
          <LocationMultiSelect name="location_ids" locations={locations} defaultSelectedIds={initialLocationIds} />
        </Field>

        <div>
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
