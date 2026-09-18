import { useCallback } from "react";

import ContentEditor from "@/components/ContentEditor";
import { SITE_FIELDS } from "@/config/content-fields";
import { useContentResource } from "@/hooks/useContentResource";
import { fetchSite, saveSite } from "@/services/content";
import type { SiteConfig } from "@/types/content";

/** 站点与导航：GET /site · PUT /site */
export default function SiteContentPage() {
  const load = useCallback(() => fetchSite(), []);
  const save = useCallback((payload: SiteConfig) => saveSite(payload), []);
  const { data, loading, saving, error, save: persist, reload } = useContentResource<SiteConfig>({ load, save });

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      await persist(values as unknown as SiteConfig);
    },
    [persist],
  );

  return (
    <ContentEditor
      testId="site-content"
      title="站点与导航"
      subTitle="站点基础信息、导航、页脚链接与 SEO"
      pageLabel="站点与导航"
      fields={SITE_FIELDS}
      value={data as unknown as Record<string, unknown> | null}
      loading={loading}
      saving={saving}
      error={error}
      onReload={reload}
      onSave={handleSave}
    />
  );
}
