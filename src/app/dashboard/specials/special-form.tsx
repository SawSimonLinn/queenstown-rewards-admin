"use client";

import { useActionState, useState } from "react";

import { Card, ErrorBanner } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { LocationMultiSelect } from "@/components/ui/multi-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { useUnsavedChangesWarning } from "@/lib/use-unsaved-changes-warning";

import type { SpecialFormState } from "./actions";

type SpecialRecord = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
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
  const formRef = useUnsavedChangesWarning<HTMLFormElement>();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image_url ?? null);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="w-full">
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <ErrorBanner message={state?.error} />

          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              name="title"
              defaultValue={initial?.title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>

          <Field label="Description" htmlFor="description" required>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={initial?.description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="start_date" required>
              <Input id="start_date" name="start_date" type="date" defaultValue={initial?.start_date?.slice(0, 10)} required />
            </Field>
            <Field label="End date" htmlFor="end_date" required>
              <Input id="end_date" name="end_date" type="date" defaultValue={initial?.end_date?.slice(0, 10)} required />
            </Field>
          </div>

          <Field label="Status" htmlFor="status" required hint="Draft promotions never appear in the mobile app.">
            <Select id="status" name="status" defaultValue={initial?.status ?? "draft"} required>
              <option value="draft">Draft</option>
              <option value="active">Active (publishable)</option>
            </Select>
          </Field>

          <Field label="Image" htmlFor="image">
            <ImageUploadField id="image" name="image" existingImageUrl={initial?.image_url} onPreviewChange={setImagePreview} />
          </Field>

          <Field label="Locations" htmlFor="location_ids" required hint="Select every location this promotion applies to.">
            <LocationMultiSelect name="location_ids" locations={locations} defaultSelectedIds={initialLocationIds} />
          </Field>

          <div>
            <SubmitButton>{submitLabel}</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Mobile app preview</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex h-36 items-center justify-center bg-cream text-muted">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs">No image</span>
            )}
          </div>
          <div className="p-4">
            <p className="font-display text-lg font-semibold text-ink">{title || "Promotion title"}</p>
            <p className="mt-1 line-clamp-3 text-sm text-muted">{description || "Promotion description will appear here."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
