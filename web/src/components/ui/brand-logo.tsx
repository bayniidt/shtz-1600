import Image from "next/image";

import { assetPath } from "@/lib/asset-path";
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
      <span className="sr-only">{logoText}</span>
      <span
        className={cn(
          "relative block h-9 w-[88px] shrink-0 overflow-hidden rounded-md bg-white",
          variant === "light" && "border border-white/20",
        )}
      >
        <Image
          src={assetPath("/shtz/logo.jpg")}
          alt=""
          fill
          sizes="88px"
          className="object-contain"
          priority
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[11px] font-semibold tracking-[0.24em]",
            variant === "light" ? "text-white/60" : "text-ink-4",
          )}
        >
          {logoSub}
        </span>
      </span>
    </span>
  );
}
