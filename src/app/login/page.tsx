"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";
import { Card, ErrorBanner } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, null);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">QR</span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand">Staff dashboard</p>
          <h1 className="font-display mt-1 text-2xl font-semibold text-ink">Queenstown Rewards</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage rewards operations.</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <ErrorBanner message={state?.error} />

          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>

          <SubmitButton pendingLabel="Signing in...">Sign in</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
