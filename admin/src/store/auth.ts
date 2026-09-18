import { create } from "zustand";

import * as authApi from "@/services/auth";
import {
  clearSession,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  type AdminUser,
} from "@/utils/token";

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  /** 是否已完成一次会话恢复（避免首屏闪烁） */
  ready: boolean;
  signingIn: boolean;
  signIn: (username: string, password: string) => Promise<AdminUser>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getToken(),
  user: getStoredUser(),
  ready: false,
  signingIn: false,

  async signIn(username, password) {
    set({ signingIn: true });
    try {
      const result = await authApi.login({ username, password });
      setToken(result.accessToken);
      setStoredUser(result.user);
      set({ token: result.accessToken, user: result.user, ready: true });
      return result.user;
    } finally {
      set({ signingIn: false });
    }
  },

  async signOut() {
    try {
      if (get().token) await authApi.logout();
    } catch {
      // 忽略登出接口错误，本地会话照常清理
    } finally {
      clearSession();
      set({ token: null, user: null });
    }
  },

  async hydrate() {
    if (!getToken()) {
      set({ ready: true, token: null, user: null });
      return;
    }
    try {
      const { user } = await authApi.fetchMe();
      setStoredUser(user);
      set({ user, token: getToken(), ready: true });
    } catch {
      clearSession();
      set({ token: null, user: null, ready: true });
    }
  },
}));
