<template>
  <Transition name="splash-out">
    <div v-if="visible" class="splash" aria-hidden="true">
      <div class="splash-aurora"></div>
      <div class="splash-grid"></div>

      <div class="splash-content">
        <h1 class="splash-title" aria-label="晓升汐落">
          <span
            v-for="(ch, i) in titleChars"
            :key="i"
            class="splash-char"
            :style="{ animationDelay: 0.28 + i * 0.085 + 's' }"
            >{{ ch }}</span
          >
        </h1>

        <div class="splash-sweep"></div>

        <p class="splash-sub">记录技术成长 · 分享编程思考</p>

        <div class="splash-progress"><i></i></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const title = "晓升汐落";
const titleChars = [...title];
const visible = ref(true);
let timer = null;

onMounted(() => {
  // 调试或截图时可用 ?nosplash=1 跳过开屏
  const skip = new URLSearchParams(window.location.search).has("nosplash");
  if (skip || sessionStorage.getItem("splash_done") === "1") {
    visible.value = false;
    return;
  }
  // 动画播完后整屏淡出
  timer = setTimeout(() => {
    visible.value = false;
    try {
      sessionStorage.setItem("splash_done", "1");
    } catch (e) {
      /* 隐私模式忽略 */
    }
  }, 2400);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: var(--bg);
  overflow: hidden;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.splash-out-leave-active {
  pointer-events: none;
}
.splash-out-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

/* 极光（浅色主题自动隐藏） */
.splash-aurora {
  position: absolute;
  width: 70vmax;
  height: 70vmax;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    color-mix(in srgb, var(--accent) 16%, transparent),
    color-mix(in srgb, var(--accent-2) 18%, transparent),
    color-mix(in srgb, var(--accent) 16%, transparent)
  );
  filter: blur(90px);
  opacity: 0;
  animation: aurora-in 1.6s ease 0.1s forwards, spin 18s linear infinite;
}

.splash-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 60px 60px;
  -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 62%);
  mask-image: radial-gradient(circle at 50% 50%, #000 0%, transparent 62%);
  opacity: 0;
  animation: fade-in 1.2s ease 0.2s forwards;
}

.splash-content {
  position: relative;
  text-align: center;
  padding: 0 24px;
}

.splash-title {
  font-size: clamp(2.6rem, 7vw, 4.4rem);
  font-weight: 700;
  letter-spacing: 0.14em;
  line-height: 1;
  display: flex;
  justify-content: center;
}

.splash-char {
  display: inline-block;
  opacity: 0;
  filter: blur(14px);
  transform: translateY(26px);
  color: var(--text-strong);
  animation: char-in 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.splash-char:nth-child(2),
.splash-char:nth-child(3) {
  color: var(--accent);
}

/* 光带扫过 */
.splash-sweep {
  position: absolute;
  top: 44%;
  left: -30%;
  width: 30%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  animation: sweep 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.95s forwards;
}

.splash-sub {
  margin-top: 28px;
  font-size: clamp(0.8rem, 1.6vw, 0.96rem);
  color: var(--text-faint);
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  opacity: 0;
  animation: sub-in 1s cubic-bezier(0.16, 1, 0.3, 1) 1.25s forwards;
}

/* 进度线 */
.splash-progress {
  margin: 34px auto 0;
  width: min(200px, 40vw);
  height: 1px;
  background: var(--border);
  overflow: hidden;
}
.splash-progress i {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--gradient);
  transform: scaleX(0);
  transform-origin: left;
  animation: progress 1.2s cubic-bezier(0.4, 0, 0.2, 1) 1.3s forwards;
}

@keyframes char-in {
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}
@keyframes aurora-in {
  to {
    opacity: var(--decor-opacity, 0.5);
  }
}
@keyframes fade-in {
  to {
    opacity: 1;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes sweep {
  0% {
    left: -30%;
    opacity: 0;
  }
  15% {
    opacity: 0.9;
  }
  85% {
    opacity: 0.9;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}
@keyframes sub-in {
  to {
    opacity: 1;
    letter-spacing: 0.2em;
  }
}
@keyframes progress {
  to {
    transform: scaleX(1);
  }
}
</style>
