"use client";

import { useActionState } from "react";

import { createNotificationCampaign, type NotificationFormState } from "@/app/dashboard/notifications/actions";
import { Card, ErrorBanner } from "@/components/ui/card";
import { checkboxClass, checkboxLabelClass, Field, Input, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";

export default function NewNotificationPage() {
  const [state, formAction] = useActionState<NotificationFormState, FormData>(
    createNotificationCampaign,
    null
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New notification" />
      <Card className="w-full max-w-2xl">
        <form action={formAction} className="flex flex-col gap-4">
          <ErrorBanner message={state?.error} />

          <Field label="Title" htmlFor="title">
            <Input id="title" name="title" required />
          </Field>

          <Field label="Body" htmlFor="body">
            <Textarea id="body" name="body" rows={3} required />
          </Field>

          <Field label="Deep link (optional)" htmlFor="deep_link">
            <Input id="deep_link" name="deep_link" placeholder="/specials" />
          </Field>

          <Field label="Schedule for later (optional)" htmlFor="scheduled_for">
            <Input id="scheduled_for" name="scheduled_for" type="datetime-local" />
          </Field>
          <p className="-mt-2 text-xs text-neutral-500">
            Scheduling saves it as &quot;scheduled&quot; — actually sending it later requires a
            scheduled job that isn&apos;t wired up yet. Use &quot;Send now&quot; below to send
            immediately.
          </p>

          <label className={checkboxLabelClass}>
            <input type="checkbox" name="send_now" className={checkboxClass} />
            <span>Send now</span>
          </label>

          <div>
            <SubmitButton>Create</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
