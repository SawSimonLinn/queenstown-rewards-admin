import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "border border-brand bg-brand text-white shadow-sm hover:border-brand-hover hover:bg-brand-hover active:bg-brand-active disabled:border-brand/40 disabled:bg-brand/40",
  outline:
    "border border-border-strong bg-surface text-ink shadow-sm hover:border-ink/30 hover:bg-cream disabled:border-border disabled:text-muted",
  ghost:
    "border border-transparent bg-transparent text-ink hover:bg-cream disabled:text-muted",
  danger:
    "border border-danger bg-danger text-white shadow-sm hover:border-danger/90 hover:bg-danger/90 active:bg-danger disabled:border-danger/40 disabled:bg-danger/40",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "min-h-9 px-3 py-1.5",
  md: "min-h-11 px-4 py-2",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return `inline-flex items-center justify-center gap-2 rounded-lg text-center text-sm font-medium leading-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-70 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClassName({ variant, size, className })} {...props} />;
}
