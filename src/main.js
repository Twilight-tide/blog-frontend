import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import App from "./App.vue";
import router from "./router";
import { initTheme } from "./styles/theme";

// 应用保存的主题（默认「墨白」），并在深色主题下启用 Element Plus 暗色变量
initTheme();

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(router);
// 中文语言包：分页、空状态等文案统一为中文
app.use(ElementPlus, { locale: zhCn });

app.mount("#app");
