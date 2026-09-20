import { useCallback } from "react";

import ContentEditor from "@/components/ContentEditor";
import { ABOUT_FIELDS } from "@/config/content-fields";
import { useContentResource } from "@/hooks/useContentResource";
import { fetchAbout, saveAbout } from "@/services/content";
import type { AboutContent } from "@/types/content";

interface AboutContentPageProps {
  compact?: boolean;
  onCancel?: () => void;
}

/** 关于我们：GET /about · PUT /about */
export default function AboutContentPage({ compact = false, onCancel }: AboutContentPageProps) {
  const load = useCallback(() => fetchAbout(), []);
  const save = useCallback((payload: AboutContent) => saveAbout(payload), []);
  const { data, loading, saving, error, save: persist, reload } = useContentResource<AboutContent>({ load, save });

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      await persist(values as unknown as AboutContent);
    },
    [persist],
  );

  return (
    <ContentEditor
      testId="about-content"
      title="关于我们"
      subTitle="公司简介、数据指标、发展历程、团队与办公地点"
      pageLabel="关于我们"
      fields={ABOUT_FIELDS}
      value={data as unknown as Record<string, unknown> | null}
      loading={loading}
      saving={saving}
      error={error}
      onReload={reload}
      onSave={handleSave}
      onCancel={onCancel}
      compact={compact}
    />
  );
}
