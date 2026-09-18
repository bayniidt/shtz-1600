import { beforeEach, describe, expect, it, vi } from "vitest";

import { feedback, setMessageInstance } from "@/utils/feedback";

describe("feedback", () => {
  it("未注入实例时调用不报错", () => {
    setMessageInstance(null as never);
    expect(() => {
      feedback.success("ok");
      feedback.error("bad");
      feedback.warning("warn");
    }).not.toThrow();
  });

  it("注入实例后转发到 antd message", () => {
    const instance = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };
    setMessageInstance(instance as never);

    feedback.success("保存成功");
    feedback.error("保存失败");
    feedback.warning("请注意");

    expect(instance.success).toHaveBeenCalledWith("保存成功");
    expect(instance.error).toHaveBeenCalledWith("保存失败");
    expect(instance.warning).toHaveBeenCalledWith("请注意");
  });
});

describe("feedback 与全局单例", () => {
  beforeEach(() => {
    setMessageInstance(null as never);
  });

  it("实例可被替换", () => {
    const first = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
    const second = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };

    setMessageInstance(first as never);
    feedback.success("a");
    setMessageInstance(second as never);
    feedback.success("b");

    expect(first.success).toHaveBeenCalledTimes(1);
    expect(second.success).toHaveBeenCalledWith("b");
  });
});
