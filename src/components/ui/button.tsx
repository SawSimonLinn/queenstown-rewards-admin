import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "border border-blue-700 bg-blue-700 text-white shadow-sm hover:border-blue-800 hover:bg-blue-800 active:bg-blue-900 disabled:border-blue-300 disabled:bg-blue-300",
  outline:
    "border border-neutral-300 bg-white text-neutral-800 shadow-sm hover:border-neutral-400 hover:bg-neutral-100 active:bg-neutral-200 disabled:border-neutral-200 disabled:text-neutral-400",
  danger:
    "border border-red-700 bg-red-700 text-white shadow-sm hover:border-red-800 hover:bg-red-800 active:bg-red-900 disabled:border-red-300 disabled:bg-red-300",
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
  return `inline-flex items-center justify-center gap-2 rounded-md text-center text-sm font-medium leading-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70 ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClassName({ variant, size, className })} {...props} />;
}
