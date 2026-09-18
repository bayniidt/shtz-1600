import { cn } from "@/lib/utils";

export function BrandLogo({
  logoText,
  logoSub,
  variant = "dark",
  className,
}: {
  logoText: string;
  logoSub: string;
  variant?: "dark" | "light";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-brand-gradient text-white shadow-[0_6px_18px_rgba(30,150,212,.35)]">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M12 3.2 20 19.4h-4.2l-1.35-2.9h-4.9L8.2 19.4H4L12 3.2Zm0 5.1-1.6 4.5h3.2L12 8.3Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[19px] font-bold tracking-[0.02em]",
            variant === "light" ? "text-white" : "text-ink",
          )}
        >
          {logoText}
        </span>
        <span
          className={cn(
            "mt-0.5 text-[10px] font-medium tracking-[0.32em]",
            variant === "light" ? "text-white/60" : "text-ink-4",
          )}
        >
          {logoSub}
        </span>
      </span>
    </span>
  );
}
