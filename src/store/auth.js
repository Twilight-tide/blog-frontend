import { defineStore } from "pinia";
import { getMe } from "../api/user";

const KEYS = ["token", "userId", "username", "nickname", "role"];

function read(key, fallback = "") {
  const value = localStorage.getItem(key);
  return value === null ? fallback : value;
}

/**
 * 登录态。角色以服务端 /api/user/me 为准，localStorage 只做首屏缓存，
 * 避免管理员改了你的角色后前端还显示旧权限。
 */
export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: read("token"),
    userId: Number(read("userId", "0")) || null,
    username: read("username"),
    nickname: read("nickname"),
    role: read("role"),
  }),

  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => s.role === "ADMIN",
    canPublish: (s) => s.role === "ADMIN" || s.role === "AUTHOR",
    displayName: (s) => s.nickname || s.username || "访客",
    roleLabel: (s) => ({ ADMIN: "管理员", AUTHOR: "作者", USER: "读者" })[s.role] || "访客",
  },

  actions: {
    /** 登录成功后写入会话 */
    setSession(data) {
      this.token = data.token || "";
      this.userId = data.userId ?? null;
      this.username = data.username || "";
      this.nickname = data.nickname || "";
      this.role = data.role || "USER";

      localStorage.setItem("token", this.token);
      localStorage.setItem("userId", String(this.userId ?? ""));
      localStorage.setItem("username", this.username);
      localStorage.setItem("nickname", this.nickname);
      localStorage.setItem("role", this.role);
    },

    clear() {
      this.token = "";
      this.userId = null;
      this.username = "";
      this.nickname = "";
      this.role = "";
      KEYS.forEach((key) => localStorage.removeItem(key));
    },

    /** 用服务端数据刷新角色；token 失效时静默清理 */
    async refresh() {
      if (!this.token) return;
      try {
        const user = await getMe();
        this.userId = user.id;
        this.username = user.username;
        this.nickname = user.nickname || "";
        this.role = user.role;
        localStorage.setItem("userId", String(user.id));
        localStorage.setItem("username", user.username);
        localStorage.setItem("nickname", this.nickname);
        localStorage.setItem("role", user.role);
      } catch (error) {
        // 401 已经在 request.js 里处理；这里只清理本地状态
        if (error?.response?.status === 401) {
          this.clear();
        }
      }
    },
  },
});
