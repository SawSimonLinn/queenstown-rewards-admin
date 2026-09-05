import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const inputClass =
  "min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-tint disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted";

export const fileInputClass =
  "block min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-ink shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-cream file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-border focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-tint";

export const checkboxClass =
  "size-4 shrink-0 rounded border-border-strong text-brand focus:ring-2 focus:ring-brand-tint";

export const checkboxLabelClass =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-border-strong hover:bg-cream has-[:checked]:border-brand-tint-border has-[:checked]:bg-brand-tint has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";

export function RequiredMark() {
  return (
    <span className="text-danger" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} min-h-24 ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}
