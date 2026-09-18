"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveCaseAction } from "@/app/(admin)/admin/actions";
import { Field, Panel, Select, StringListField, TextArea } from "@/components/admin/Fields";
import { initialActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import type { CaseItem } from "@/types";

const INDUSTRIES: CaseItem["industry"][] = ["ecommerce", "game", "app", "brand"];

interface Stat {
  rid: number;
  value: string;
  unit: string;
  label: string;
}

interface Block {
  rid: number;
  key: string;
  title: string;
  body: string;
  points: string;
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-4 focus:border-brand/60 focus:ring-3 focus:ring-brand/15";

export function CaseForm({ item }: { item: CaseItem }) {
  const [state, formAction, pending] = useActionState(saveCaseAction, initialActionState);

  const [stats, setStats] = useState<Stat[]>(() =>
    item.stats.map((stat, i) => ({ rid: i, value: stat.value, unit: stat.unit ?? "", label: stat.label })),
  );
  const [blocks, setBlocks] = useState<Block[]>(() =>
    item.blocks.map((block, i) => ({
      rid: i,
      key: block.key,
      title: block.title,
      body: block.body.join("\n"),
      points: (block.points ?? []).join("\n"),
    })),
  );
  const [nextRid, setNextRid] = useState(1000);

  const addStat = () => {
    setStats((prev) => [...prev, { rid: nextRid, value: "", unit: "", label: "" }]);
    setNextRid((n) => n + 1);
  };
  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { rid: nextRid, key: `block-${prev.length + 1}`, title: "", body: "", points: "" },
    ]);
    setNextRid((n) => n + 1);
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="__statCount" value={stats.length} />
      <input type="hidden" name="__blockCount" value={blocks.length} />

      <Panel title="基础信息">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="案例 ID" name="__idView" defaultValue={item.id} hint="ID 用于生成 /cases/[id] 链接，保存后不可更改" />
          <Field label="案例标题" name="title" defaultValue={item.title} />
          <Field label="客户名称" name="client" defaultValue={item.client} />
          <Select
            label="所属行业"
            name="industry"
            defaultValue={item.industry}
            options={INDUSTRIES.map((value) => ({ value, label: value }))}
          />
          <Field label="投放区域" name="region" defaultValue={item.region} />
          <Field label="合作年份" name="year" defaultValue={item.year} />
          <Field
            label="封面图路径"
            name="cover"
            defaultValue={item.cover}
            hint="例如 /images/adfly/banner01.png"
          />
        </div>
        <TextArea label="案例简介" name="summary" defaultValue={item.summary} rows={3} />
        <div className="grid gap-5 md:grid-cols-2">
          <StringListField name="tags" label="标签" defaultValue={item.tags} placeholder="例如 效果营销" />
          <StringListField
            name="awards"
            label="所获奖项"
            defaultValue={item.awards}
            placeholder="例如 年度最佳出海案例"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-[13px] font-medium text-ink">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={item.featured}
            className="size-4 cursor-pointer accent-[var(--color-brand)]"
          />
          在首页 / 案例列表优先展示
        </label>
      </Panel>

      <Panel title="核心数据指标">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addStat}
            className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-brand transition-colors hover:border-brand/40 hover:bg-brand-soft"
          >
            + 添加指标
          </button>
        </div>
        {stats.map((stat, index) => (
          <div key={stat.rid} className="rounded-xl border border-line bg-surface/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-medium text-ink-4">指标 #{index + 1}</span>
              <button
                type="button"
                onClick={() => setStats((prev) => prev.filter((s) => s.rid !== stat.rid))}
                className="cursor-pointer text-[12px] text-red-500 hover:opacity-70"
              >
                删除
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                name={`stat_${index}_value`}
                value={stat.value}
                placeholder="数值，如 320"
                onChange={(e) =>
                  setStats((prev) =>
                    prev.map((s) => (s.rid === stat.rid ? { ...s, value: e.target.value } : s)),
                  )
                }
                className={inputClass}
              />
              <input
                name={`stat_${index}_unit`}
                value={stat.unit}
                placeholder="单位，如 %"
                onChange={(e) =>
                  setStats((prev) =>
                    prev.map((s) => (s.rid === stat.rid ? { ...s, unit: e.target.value } : s)),
                  )
                }
                className={inputClass}
              />
              <input
                name={`stat_${index}_label`}
                value={stat.label}
                placeholder="说明，如 ROI 提升"
                onChange={(e) =>
                  setStats((prev) =>
                    prev.map((s) => (s.rid === stat.rid ? { ...s, label: e.target.value } : s)),
                  )
                }
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="项目内容板块" description="每个板块对应详情页的一段内容">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addBlock}
            className="cursor-pointer rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-brand transition-colors hover:border-brand/40 hover:bg-brand-soft"
          >
            + 添加板块
          </button>
        </div>
        {blocks.map((block, index) => (
          <div key={block.rid} className="rounded-xl border border-line bg-surface/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-medium text-ink-4">板块 #{index + 1}</span>
              <button
                type="button"
                onClick={() => setBlocks((prev) => prev.filter((b) => b.rid !== block.rid))}
                className="cursor-pointer text-[12px] text-red-500 hover:opacity-70"
              >
                删除
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name={`block_${index}_key`}
                  value={block.key}
                  placeholder="标识（英文，如 background）"
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) => (b.rid === block.rid ? { ...b, key: e.target.value } : b)),
                    )
                  }
                  className={inputClass}
                />
                <input
                  name={`block_${index}_title`}
                  value={block.title}
                  placeholder="板块标题"
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) => (b.rid === block.rid ? { ...b, title: e.target.value } : b)),
                    )
                  }
                  className={inputClass}
                />
              </div>
              <textarea
                name={`block_${index}_body`}
                value={block.body}
                rows={4}
                placeholder="正文段落，每行一段"
                onChange={(e) =>
                  setBlocks((prev) =>
                    prev.map((b) => (b.rid === block.rid ? { ...b, body: e.target.value } : b)),
                  )
                }
                className={cn(inputClass, "resize-y leading-relaxed")}
              />
              <textarea
                name={`block_${index}_points`}
                value={block.points}
                rows={3}
                placeholder="要点列表，每行一条（可留空）"
                onChange={(e) =>
                  setBlocks((prev) =>
                    prev.map((b) => (b.rid === block.rid ? { ...b, points: e.target.value } : b)),
                  )
                }
                className={cn(inputClass, "resize-y leading-relaxed")}
              />
            </div>
          </div>
        ))}
      </Panel>

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
          <Link
            href={`/cases/${item.id}`}
            target="_blank"
            className="text-[13px] text-ink-3 transition-colors hover:text-brand"
          >
            前台预览 ↗
          </Link>
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
