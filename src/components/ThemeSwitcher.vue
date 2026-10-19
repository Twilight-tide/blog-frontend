<template>
  <div class="theme-switch">
    <button
      class="trigger"
      :class="{ open }"
      aria-label="切换主题"
      :title="currentName"
      @click="open = !open"
    >
      <span class="ring" :style="{ background: currentColor }"></span>
    </button>

    <Transition name="pop">
      <ul v-if="open" class="menu">
        <li
          v-for="t in themes"
          :key="t.id"
          class="item"
          :class="{ active: current === t.id }"
          @click="select(t.id)"
        >
          <span class="swatch" :style="{ background: t.color }"></span>
          <span class="name">{{ t.name }}</span>
          <span v-if="current === t.id" class="check">✓</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { THEMES, applyTheme, getStoredTheme, DEFAULT_THEME } from "../styles/theme";

const themes = THEMES;
const open = ref(false);
const current = ref(DEFAULT_THEME);

const currentColor = computed(
  () => (themes.find((t) => t.id === current.value) || themes[0]).color
);
const currentName = computed(
  () => (themes.find((t) => t.id === current.value) || themes[0]).name
);

const select = (id) => {
  current.value = applyTheme(id);
  open.value = false;
};

const closeOnOutside = (e) => {
  if (!e.target.closest(".theme-switch")) open.value = false;
};

onMounted(() => {
  current.value = getStoredTheme() || DEFAULT_THEME;
  document.addEventListener("click", closeOnOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", closeOnOutside);
});
</script>

<style scoped>
.theme-switch {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 300;
}

.trigger {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow);
  transition: transform 0.35s var(--ease), border-color 0.35s var(--ease),
    box-shadow 0.35s var(--ease);
}

.trigger:hover {
  transform: translateY(-2px) rotate(-8deg);
  border-color: var(--border-strong);
  box-shadow: var(--card-shadow-hover);
}

.trigger.open {
  transform: rotate(-90deg);
}

.ring {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  box-shadow: inset 0 0 0 3px var(--bg-soft);
  transition: background 0.4s var(--ease);
}

.menu {
  position: absolute;
  right: 0;
  bottom: 58px;
  min-width: 156px;
  padding: 6px;
  list-style: none;
  border-radius: 14px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow-hover);
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 9px;
  font-size: 0.84rem;
  color: var(--text-dim);
  cursor: pointer;
  transition: background 0.25s var(--ease), color 0.25s var(--ease);
}

.item:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.item.active {
  color: var(--text-strong);
  background: var(--surface);
}

.swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  flex-shrink: 0;
}

.name {
  flex: 1;
}

.check {
  font-size: 0.72rem;
  color: var(--accent);
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.22s var(--ease), transform 0.22s var(--ease);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}

@media (max-width: 720px) {
  .theme-switch {
    right: 16px;
    bottom: 16px;
  }
}
</style>
