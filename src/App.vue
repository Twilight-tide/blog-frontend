<template>
  <div id="app">
    <!-- 全局背景装饰：极光 + 网格 -->
    <div class="aurora"></div>
    <div class="grid-overlay"></div>

    <!-- 开屏动画（同一会话只播一次） -->
    <SplashScreen />

    <!-- 路由页面 + 过渡 -->
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- 主题切换器 -->
    <ThemeSwitcher />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import SplashScreen from "./components/SplashScreen.vue";
import ThemeSwitcher from "./components/ThemeSwitcher.vue";
import { useAuthStore } from "./store/auth";
import "./styles/theme.css";

const auth = useAuthStore();

// 启动时用服务端数据校准角色：管理员改了你的权限，下次打开页面就会生效
onMounted(() => {
  auth.refresh();
});
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}
</style>
