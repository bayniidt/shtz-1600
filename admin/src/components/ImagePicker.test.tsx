import { useState } from "react";
import { describe, expect, it } from "vitest";

import ImagePicker, { isPreviewableImage } from "@/components/ImagePicker";
import { renderWithProviders, screen, userEvent } from "@/test/utils";

function Harness({ initial = "", hidePreview }: { initial?: string; hidePreview?: boolean }) {
  const [value, setValue] = useState(initial);
  return (
    <div>
      <ImagePicker value={value} onChange={setValue} hidePreview={hidePreview} />
      <span data-testid="value">{value}</span>
    </div>
  );
}

describe("isPreviewableImage", () => {
  it("识别站内路径 / http(s) / data URI", () => {
    expect(isPreviewableImage("/images/a.png")).toBe(true);
    expect(isPreviewableImage("https://cdn.example.com/a.png")).toBe(true);
    expect(isPreviewableImage("http://cdn.example.com/a.png")).toBe(true);
    expect(isPreviewableImage("//cdn.example.com/a.png")).toBe(true);
    expect(isPreviewableImage("data:image/png;base64,AAA")).toBe(true);
  });

  it("拒绝空值与相对路径", () => {
    expect(isPreviewableImage(undefined)).toBe(false);
    expect(isPreviewableImage("")).toBe(false);
    expect(isPreviewableImage("   ")).toBe(false);
    expect(isPreviewableImage("images/a.png")).toBe(false);
  });
});

describe("ImagePicker", () => {
  it("输入图片地址会同步 value 并展示预览", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    expect(screen.queryByAltText("图片预览")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("图片地址"), "/images/hero.jpg");
    expect(screen.getByTestId("value")).toHaveTextContent("/images/hero.jpg");
    expect(screen.getByAltText("图片预览")).toHaveAttribute(
      "src",
      "http://localhost:3000/images/hero.jpg",
    );
  });

  it("非法地址给出提示且不预览", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.type(screen.getByLabelText("图片地址"), "images/a.png");
    expect(screen.getByText(/建议使用/)).toBeInTheDocument();
    expect(screen.queryByAltText("图片预览")).not.toBeInTheDocument();
  });

  it("清空按钮重置 value 并隐藏预览", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness initial="/images/a.png" />);
    expect(screen.getByAltText("图片预览")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "清空图片" }));
    expect(screen.getByTestId("value")).toHaveTextContent("");
    expect(screen.queryByAltText("图片预览")).not.toBeInTheDocument();
  });

  it("空值时清空按钮禁用", () => {
    renderWithProviders(<Harness />);
    expect(screen.getByRole("button", { name: "清空图片" })).toBeDisabled();
  });

  it("hidePreview=true 时不渲染缩略图", () => {
    renderWithProviders(<Harness initial="/images/a.png" hidePreview />);
    expect(screen.queryByAltText("图片预览")).not.toBeInTheDocument();
    expect(screen.getByTestId("value")).toHaveTextContent("/images/a.png");
  });

  it("disabled 时输入框不可编辑", () => {
    renderWithProviders(
      <ImagePicker value="/images/a.png" onChange={() => undefined} disabled />,
    );
    expect(screen.getByLabelText("图片地址")).toBeDisabled();
    expect(screen.getByRole("button", { name: "清空图片" })).toBeDisabled();
  });
});
