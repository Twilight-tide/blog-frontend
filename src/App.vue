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
import SplashScreen from "./components/SplashScreen.vue";
import ThemeSwitcher from "./components/ThemeSwitcher.vue";
import "./styles/theme.css";
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}
</style>
