import { Flex, Space, Typography } from "antd";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { groupOf } from "@/config/menu";

export interface PageContainerProps {
  title: string;
  subTitle?: string;
  extra?: ReactNode;
  children?: ReactNode;
}

/** 统一页面容器：眉标 / 标题 / 副标题 / 右上角操作区，底部以发丝线分隔内容。 */
export default function PageContainer({ title, subTitle, extra, children }: PageContainerProps) {
  const location = useLocation();

  return (
    <div className="adfly-page" data-testid="page-container">
      <Flex className="adfly-page-head" align="flex-start" justify="space-between" gap={16} wrap>
        <Space className="adfly-page-heading" direction="vertical" size={4}>
          <span className="adfly-eyebrow">
            <span className="adfly-eyebrow-dot" />
            {groupOf(location.pathname)}
          </span>
          <Typography.Title level={4} className="adfly-page-title" data-testid="page-title">
            {title}
          </Typography.Title>
          {subTitle && (
            <Typography.Text
              type="secondary"
              className="adfly-page-subtitle"
              data-testid="page-subtitle"
            >
              {subTitle}
            </Typography.Text>
          )}
        </Space>
        {extra && (
          <div className="adfly-page-extra" data-testid="page-extra">
            {extra}
          </div>
        )}
      </Flex>
      <div className="adfly-page-body">{children}</div>
    </div>
  );
}
