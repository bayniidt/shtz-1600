import { Space, Typography } from "antd";
import type { ReactNode } from "react";

export interface PageContainerProps {
  title: string;
  subTitle?: string;
  extra?: ReactNode;
  children?: ReactNode;
}

/** 统一页面容器：标题 / 副标题 / 右上角操作区。 */
export default function PageContainer({ title, subTitle, extra, children }: PageContainerProps) {
  return (
    <div className="adfly-page" data-testid="page-container">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Space direction="vertical" size={2}>
          <Typography.Title level={4} style={{ margin: 0 }} data-testid="page-title">
            {title}
          </Typography.Title>
          {subTitle && (
            <Typography.Text type="secondary" data-testid="page-subtitle">
              {subTitle}
            </Typography.Text>
          )}
        </Space>
        {extra && <div data-testid="page-extra">{extra}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
