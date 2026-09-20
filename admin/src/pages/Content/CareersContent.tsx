import { useCallback } from "react";

import ContentEditor from "@/components/ContentEditor";
import { CAREERS_CONTENT_FIELDS } from "@/config/content-fields";
import { useContentResource } from "@/hooks/useContentResource";
import { fetchCareersContent, saveCareersContent } from "@/services/content";
import type { CareersContent } from "@/types/content";

interface CareersContentPageProps {
  compact?: boolean;
  onCancel?: () => void;
}

/** 招聘页面文案：GET /careers/content · PUT /careers/content */
export default function CareersContentPage({ compact = false, onCancel }: CareersContentPageProps) {
  const load = useCallback(() => fetchCareersContent(), []);
  const save = useCallback((payload: CareersContent) => saveCareersContent(payload), []);
  const { data, loading, saving, error, save: persist, reload } = useContentResource<CareersContent>({
    load,
    save,
  });

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      await persist(values as unknown as CareersContent);
    },
    [persist],
  );

  return (
    <ContentEditor
      testId="careers-content"
      title="招聘内容"
      subTitle="招聘页首屏文案、企业文化与福利说明（城市与职位请前往「招聘管理」）"
      pageLabel="招聘内容"
      fields={CAREERS_CONTENT_FIELDS}
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
