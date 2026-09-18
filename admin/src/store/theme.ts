import { create } from "zustand";

import { DEFAULT_ADMIN_THEME, applyCssVariables, mergeTheme, type AdminTheme, type ThemePatch } from "@/config/theme";
import { fetchTheme } from "@/services/settings";

interface ThemeState {
  theme: AdminTheme;
  loaded: boolean;
  /** 拉取远端主题（失败时回退默认） */
  load: () => Promise<void>;
  /** 用接口返回的局部主题覆盖当前主题（保存后立即生效，免二次请求） */
  applyRemote: (remote: ThemePatch | null | undefined) => AdminTheme;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: DEFAULT_ADMIN_THEME,
  loaded: false,

  async load() {
    try {
      const remote = await fetchTheme();
      get().applyRemote(remote);
    } catch {
      applyCssVariables(DEFAULT_ADMIN_THEME);
      set({ theme: DEFAULT_ADMIN_THEME, loaded: true });
    }
  },

  applyRemote(remote) {
    const theme = mergeTheme(DEFAULT_ADMIN_THEME, remote);
    applyCssVariables(theme);
    set({ theme, loaded: true });
    return theme;
  },
}));
