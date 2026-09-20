import { Segmented, Space, Typography } from "antd";

import type { Locale } from "@/types/i18n";

interface LanguageSwitcherProps {
  value: Locale;
  onChange: (locale: Locale) => void;
}

/** 编辑表单语言切换：中文是兼容旧数据的默认主语言，英文保存为 translations.en。 */
export default function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  return (
    <Space size={8}>
      <Typography.Text type="secondary">编辑语言</Typography.Text>
      <Segmented<Locale>
        size="small"
        value={value}
        options={[
          { label: "中文", value: "zh" },
          { label: "English", value: "en" },
        ]}
        onChange={onChange}
      />
    </Space>
  );
}
