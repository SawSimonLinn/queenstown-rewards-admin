"use client";

import { useState, useTransition } from "react";

import { createNotificationCampaign, type NotificationFormState } from "@/app/dashboard/notifications/actions";
import { Button } from "@/components/ui/button";
import { Card, ErrorBanner } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { checkboxClass, checkboxLabelClass, Field, Input, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";

export default function NewNotificationPage() {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result: NotificationFormState = await createNotificationCampaign(null, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      showToast(sendNow ? "Notification sent." : "Notification saved.", "success");
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (sendNow) {
      setPendingFormData(formData);
      setConfirmOpen(true);
      return;
    }
    submit(formData);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New notification"
        breadcrumbs={[{ label: "Notifications", href: "/dashboard/notifications" }, { label: "New" }]}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <ErrorBanner message={error} />

            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Field>

            <Field label="Message" htmlFor="body" required>
              <Textarea id="body" name="body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} required />
            </Field>

            <p className="text-sm font-medium text-ink">Audience: all customers</p>

            <Field label="Deep link or call-to-action (optional)" htmlFor="deep_link">
              <Input id="deep_link" name="deep_link" placeholder="/specials" value={deepLink} onChange={(e) => setDeepLink(e.target.value)} />
            </Field>

            <Field
              label="Schedule for later (optional)"
              htmlFor="scheduled_for"
              hint="Dispatched automatically by the scheduled job once it's deployed — see the README runbook. Leave blank to send now instead."
            >
              <Input
                id="scheduled_for"
                name="scheduled_for"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                disabled={sendNow}
              />
            </Field>

            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                name="send_now"
                className={checkboxClass}
                checked={sendNow}
                onChange={(e) => setSendNow(e.target.checked)}
              />
              <span>Send now</span>
            </label>

            <div>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? <Spinner /> : null}
                {sendNow ? "Review and send" : "Save"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Push notification preview</p>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-muted">Queenstown Rewards</p>
            <p className="mt-1 text-sm font-semibold text-ink">{title || "Notification title"}</p>
            <p className="mt-0.5 text-sm text-muted">{body || "Notification message will appear here."}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Send notification now"
        description="This immediately pushes the notification to every customer device with a registered push token. This cannot be undone."
        confirmLabel="Send now"
        onConfirm={async () => {
          if (pendingFormData) submit(pendingFormData);
        }}
      />
    </div>
  );
}
