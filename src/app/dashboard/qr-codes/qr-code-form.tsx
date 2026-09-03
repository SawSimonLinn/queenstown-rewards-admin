"use client";

import { useActionState } from "react";

import { createQrCode, type QrFormState } from "@/app/dashboard/qr-codes/actions";
import { Card, ErrorBanner } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

type Option = { id: string; name: string };

export function QrCodeForm({
  locations,
  campaigns,
}: {
  locations: Option[];
  campaigns: Option[];
}) {
  const [state, formAction] = useActionState<QrFormState, FormData>(createQrCode, null);

  const defaultExpiry = new Date();
  defaultExpiry.setMonth(defaultExpiry.getMonth() + 1);

  return (
    <Card className="w-full max-w-xl">
      <form action={formAction} className="flex flex-col gap-4">
        <ErrorBanner message={state?.error} />

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

        <Field label="Campaign" htmlFor="campaign_id">
          <Select id="campaign_id" name="campaign_id" required defaultValue="">
            <option value="" disabled>
              Select a campaign
            </option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Expires at" htmlFor="expires_at">
          <Input
            id="expires_at"
            name="expires_at"
            type="datetime-local"
            defaultValue={defaultExpiry.toISOString().slice(0, 16)}
            required
          />
        </Field>

        <div>
          <SubmitButton>Generate</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
