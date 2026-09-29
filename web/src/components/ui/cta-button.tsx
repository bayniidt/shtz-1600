import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "light";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ease-[var(--ease-out-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-[var(--shadow-brand)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_40px_rgba(235,52,7,.35)]",
  outline:
    "border border-line bg-white text-ink hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand hover:shadow-[var(--shadow-card)]",
  ghost: "text-ink hover:text-brand",
  light:
    "border border-white/25 bg-white/10 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white/20",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-[15px]",
  lg: "h-13 px-8 text-base",
};

interface CtaButtonProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  external?: boolean;
}

export function CtaButton({
  variant = "primary",
  size = "md",
  className,
  children,
  external,
  href,
  ...props
}: CtaButtonProps) {
  const isAnchor = typeof href === "string" && href.startsWith("#");
  const isExternal = external || (typeof href === "string" && href.startsWith("http"));

  const classes = cn(base, variants[variant], sizes[size], className);

  if (isAnchor || isExternal) {
    return (
      <a
        href={href as string}
        className={classes}
        {...(isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
