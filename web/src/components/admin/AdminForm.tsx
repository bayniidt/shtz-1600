"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { initialActionState, type ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type ServerAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function AdminForm({
  action,
  path,
  label,
  children,
  footer,
  className,
}: {
  action: ServerAction;
  path: string;
  label: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className={cn("flex flex-col gap-6", className)}>
      <input type="hidden" name="__path" value={path} />
      <input type="hidden" name="__label" value={label} />
      {children}

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white/90 px-5 py-4 backdrop-blur">
        <p
          className={cn(
            "text-sm",
            state.status === "success" && "text-emerald-600",
            state.status === "error" && "text-red-600",
            state.status === "idle" && "text-ink-4",
          )}
          role="status"
        >
          {state.status === "idle" ? "修改后记得保存" : state.message}
        </p>
        <div className="flex items-center gap-3">
          {footer}
          <button
            type="submit"
            disabled={pending}
            className="h-11 cursor-pointer rounded-xl bg-brand-gradient px-7 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </form>
  );
}
