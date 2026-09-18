import { ClearOutlined } from "@ant-design/icons";
import { Button, Image, Input, Space, Typography } from "antd";
import { useMemo, useState } from "react";

export interface ImagePickerProps {
  /** antd Form.Item 注入：图片地址 */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 关闭预览缩略图 */
  hidePreview?: boolean;
}

const REMOTE_PATTERN = /^(https?:)?\/\//i;

/** 判断是否是可安全预览的图片地址（站内路径 / http(s) / data URI）。 */
export function isPreviewableImage(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (REMOTE_PATTERN.test(trimmed)) return true;
  if (trimmed.startsWith("data:image/")) return true;
  return trimmed.startsWith("/");
}

/**
 * 图片选择器：粘贴图片路径 / 外链，实时预览缩略图。
 * Stage 1 先支持「路径输入 + 预览」，后续阶段可无侵入地接入素材库上传。
 */
export default function ImagePicker({
  value,
  onChange,
  placeholder = "/images/xxx.jpg 或 https://…",
  disabled = false,
  hidePreview = false,
}: ImagePickerProps) {
  const current = value ?? "";
  const [broken, setBroken] = useState(false);

  const previewable = useMemo(() => isPreviewableImage(current), [current]);
  const showWarning = current.trim().length > 0 && !previewable;

  return (
    <div className="adfly-image-picker" data-testid="image-picker">
      <Space.Compact style={{ width: "100%" }}>
        <Input
          value={current}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="图片地址"
          onChange={(event) => {
            setBroken(false);
            onChange?.(event.target.value);
          }}
        />
        <Button
          icon={<ClearOutlined />}
          disabled={disabled || current.length === 0}
          aria-label="清空图片"
          onClick={() => {
            setBroken(false);
            onChange?.("");
          }}
        >
          清空
        </Button>
      </Space.Compact>

      {showWarning && (
        <Typography.Text type="warning" style={{ display: "block", marginTop: 6 }}>
          建议使用 “/images/…” 或 “https://…” 开头的图片地址
        </Typography.Text>
      )}

      {!hidePreview && previewable && (
        <div style={{ marginTop: 10 }}>
          <Image
            src={current}
            alt="图片预览"
            width={120}
            onError={() => setBroken(true)}
            fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9IiNmMmYyZjIiLz48L3N2Zz4="
          />
          {broken && (
            <Typography.Text type="secondary" style={{ display: "block" }}>
              图片无法加载，请检查路径是否正确
            </Typography.Text>
          )}
        </div>
      )}
    </div>
  );
}
