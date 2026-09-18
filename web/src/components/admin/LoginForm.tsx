"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/(admin)/admin/actions";
import { initialActionState } from "@/lib/action-state";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink">管理密码</span>
        <input
          type="password"
          name="password"
          autoFocus
          placeholder="请输入管理密码"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-all focus:border-brand/60 focus:ring-3 focus:ring-brand/15"
        />
      </label>

      {state.status === "error" ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 cursor-pointer rounded-xl bg-brand-gradient text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "登录中…" : "登录"}
      </button>

      <p className="text-center text-[12px] text-ink-4">
        默认密码 <code className="rounded bg-surface px-1.5 py-0.5">adfly2024</code>，可通过环境变量
        <code className="mx-1 rounded bg-surface px-1.5 py-0.5">ADMIN_PASSWORD</code> 覆盖。
      </p>
    </form>
  );
}
