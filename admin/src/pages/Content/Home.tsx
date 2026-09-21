import { Tabs } from "antd";
import { useCallback, useEffect, useState } from "react";

import ContentEditor from "@/components/ContentEditor";
import PageContainer from "@/components/PageContainer";
import { HOME_SECTION_FIELDS } from "@/config/content-fields";
import { fetchHome, saveHomeSection } from "@/services/content";
import { HOME_SECTIONS, type HomeContent, type HomeSectionKey } from "@/types/content";

function toMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "请求失败，请稍后重试";
}

/**
 * 首页内容：GET /home 读取全部板块，PUT /home/:section 按板块保存。
 * 切换 Tab 不会丢弃其他板块未保存的编辑。
 */
interface HomeContentPageProps {
  compact?: boolean;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function HomeContentPage({ compact = false, onCancel, onDirtyChange }: HomeContentPageProps) {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<HomeSectionKey | null>(null);
  const [dirtySections, setDirtySections] = useState<Partial<Record<HomeSectionKey, boolean>>>({});

  const handleSectionDirtyChange = useCallback((section: HomeSectionKey, dirty: boolean) => {
    setDirtySections((current) => ({ ...current, [section]: dirty }));
  }, []);

  useEffect(() => {
    onDirtyChange?.(Object.values(dirtySections).some(Boolean));
  }, [dirtySections, onDirtyChange]);

  const loadHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHome(await fetchHome());
    } catch (loadError) {
      setError(toMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  const handleSave = useCallback(
    async (section: HomeSectionKey, values: Record<string, unknown>) => {
      setSavingSection(section);
      try {
        const next = await saveHomeSection(section, values as never);
        setHome(next);
      } finally {
        setSavingSection(null);
      }
    },
    [],
  );

  const body = (
    <Tabs
        items={HOME_SECTIONS.map(({ key, label, description }) => ({
          key,
          label,
          children: (
            <ContentEditor
              compact
              testId={`home-${key}`}
              // dirtyId 固定为板块名，避免 Tab 切换时互相覆盖
              dirtyId={`home-${key}`}
              title={label}
              subTitle={description}
              pageLabel={`首页内容 · ${label}`}
              fields={HOME_SECTION_FIELDS[key]}
              value={home ? (home[key] as unknown as Record<string, unknown>) : null}
              loading={loading}
              saving={savingSection === key}
              error={error}
              onReload={() => void loadHome()}
              onSave={(values) => handleSave(key, values)}
              onCancel={onCancel}
              onDirtyChange={(dirty) => handleSectionDirtyChange(key, dirty)}
              bilingual
            />
          ),
        }))}
      />
  );

  return compact ? body : <PageContainer title="首页内容" subTitle="首页 6 个板块分别保存，互不影响">{body}</PageContainer>;
}
