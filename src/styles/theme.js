export const THEMES = [
  { id: "paper", name: "墨白", color: "#f7f5f0", dark: false },
  { id: "sand", name: "暖砂", color: "#f0ebe3", dark: false },
  { id: "graphite", name: "石墨", color: "#121316", dark: true },
  { id: "dusk", name: "暮光", color: "#0b0f16", dark: true },
];

export const DEFAULT_THEME = "paper";
const STORAGE_KEY = "theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

export function applyTheme(id) {
  const theme = THEMES.find((t) => t.id === id) || THEMES[0];
  const root = document.documentElement;
  root.setAttribute("data-theme", theme.id);
  // 深色主题下启用 Element Plus 的暗色变量
  root.classList.toggle("dark", !!theme.dark);
  try {
    localStorage.setItem(STORAGE_KEY, theme.id);
  } catch (e) {
    /* 隐私模式忽略 */
  }
  return theme.id;
}

export function initTheme() {
  // 支持 ?theme=paper|sand|graphite|dusk 直接预览
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("theme");
    if (fromUrl && THEMES.some((t) => t.id === fromUrl)) {
      return applyTheme(fromUrl);
    }
  } catch (e) {
    /* ignore */
  }
  return applyTheme(getStoredTheme() || DEFAULT_THEME);
}
