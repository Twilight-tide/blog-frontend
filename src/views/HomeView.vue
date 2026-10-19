<template>
  <div class="home">
    <!-- ====== 导航 ====== -->
    <header class="nav" :class="{ scrolled }">
      <div class="nav-inner">
        <a class="brand" href="#" @click.prevent="scrollTop">
          <span class="brand-dot"></span>
          <span class="brand-text">晓升汐落</span>
        </a>
        <nav class="nav-links">
          <a class="nav-link" href="#articles">文章</a>
          <button v-if="isLoggedIn" class="btn-ghost" @click="goToAdmin">
            管理后台
          </button>
          <button v-else class="btn-ghost" @click="goLogin">登录</button>
        </nav>
      </div>
    </header>

    <!-- ====== Hero ====== -->
    <section class="hero">
      <p class="hero-kicker">TWILIGHT · BLOG</p>

      <h1 class="hero-title">
        <span class="gradient-text">晓升汐落</span>
        <span class="hero-title-sub">的技术博客</span>
      </h1>

      <p class="hero-desc">记录技术成长，分享编程思考</p>

      <div class="hero-stats">
        <div class="stat">
          <strong>{{ articles.length }}</strong>
          <span>篇文章</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <strong>{{ categories.length }}</strong>
          <span>个分类</span>
        </div>
      </div>

      <a class="scroll-hint" href="#articles" aria-label="向下滚动">
        <span>向下滚动</span>
        <i></i>
      </a>
    </section>

    <!-- ====== 文章区 ====== -->
    <main id="articles" class="content">
      <div class="section-head reveal">
        <h2 class="section-title">最新文章</h2>
        <div class="filters">
          <button
            class="filter"
            :class="{ active: selectedCategory === '' }"
            @click="filterByCategory('')"
          >
            全部
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            class="filter"
            :class="{ active: selectedCategory === cat }"
            @click="filterByCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading">
        <span class="loading-bar"></span>
        <p>正在加载文章…</p>
      </div>

      <!-- 列表 -->
      <div v-else-if="displayArticles.length > 0" class="cards">
        <article
          v-for="(article, i) in displayArticles"
          :key="article.id"
          class="card reveal"
          :style="{ '--d': i * 70 + 'ms' }"
          @click="goToDetail(article.id)"
        >
          <div class="card-meta">
            <span class="tag">{{ article.category || "未分类" }}</span>
            <span class="date">{{ formatDate(article.createTime) }}</span>
          </div>

          <h3 class="card-title">{{ article.title }}</h3>
          <p class="card-summary">{{ summaryOf(article) }}</p>

          <div class="card-foot">
            <span>👁 {{ article.viewCount }}</span>
            <span>❤ {{ article.likeCount }}</span>
            <span class="card-arrow">阅读全文 →</span>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty">
        <div class="empty-icon">✦</div>
        <p>这里还没有文章</p>
      </div>

      <!-- 加载更多 -->
      <div
        v-if="!loading && filteredByCategory.length > displayArticles.length"
        class="more"
      >
        <button class="btn-more" @click="loadMore">加载更多</button>
      </div>
      <div
        v-else-if="!loading && displayArticles.length > 0"
        class="list-end"
      >
        — 已经到底了 —
      </div>
    </main>

    <!-- ====== 页脚 ====== -->
    <footer class="footer">
      <p>© {{ year }} 晓升汐落 · 用代码记录思考</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { getArticleList } from "../api/article";

const router = useRouter();
const articles = ref([]);
const loading = ref(true);
const selectedCategory = ref("");
const pageSize = ref(5);
const currentPage = ref(1);
const scrolled = ref(false);
const year = new Date().getFullYear();

let observer = null;

// 所有分类
const categories = computed(() => {
  const set = new Set();
  articles.value.forEach((a) => {
    if (a.category) set.add(a.category);
  });
  return Array.from(set);
});

// 1. 先按分类筛选
const filteredByCategory = computed(() => {
  if (!selectedCategory.value) return articles.value;
  return articles.value.filter((a) => a.category === selectedCategory.value);
});

// 2. 再按分页截取
const displayArticles = computed(() => {
  return filteredByCategory.value.slice(0, currentPage.value * pageSize.value);
});

const isLoggedIn = computed(() => !!localStorage.getItem("token"));

// 去掉 HTML 标签后截断
const stripHtml = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || "").replace(/\s+/g, " ").trim();
};

const summaryOf = (article) => {
  const text = article.summary || stripHtml(article.content);
  if (!text) return "";
  return text.length > 120 ? text.slice(0, 120) + "…" : text;
};

// 加载更多
const loadMore = () => {
  currentPage.value++;
  requestAnimationFrame(observeReveals);
};

// 筛选分类（重置分页）
const filterByCategory = (cat) => {
  selectedCategory.value = cat;
  currentPage.value = 1;
  requestAnimationFrame(observeReveals);
};

const fetchArticles = async () => {
  try {
    loading.value = true;
    articles.value = await getArticleList();
  } catch (error) {
    console.error("获取文章列表失败:", error);
  } finally {
    loading.value = false;
    requestAnimationFrame(observeReveals);
  }
};

const goToDetail = (id) => {
  router.push(`/article/${id}`);
};

const goToAdmin = () => {
  router.push("/admin");
};

const goLogin = () => {
  router.push("/login");
};

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 滚动监听 + 元素进入视口
const onScroll = () => {
  scrolled.value = window.scrollY > 40;
};

const observeReveals = () => {
  if (!observer) return;
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
    observer.observe(el);
  });
};

onMounted(() => {
  fetchArticles();
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  requestAnimationFrame(observeReveals);
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* ====== 导航 ====== */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 72px;
  display: flex;
  align-items: center;
  transition: background 0.4s var(--ease), border-color 0.4s var(--ease),
    backdrop-filter 0.4s var(--ease);
  border-bottom: 1px solid transparent;
}

.nav.scrolled {
  background: rgba(7, 8, 13, 0.72);
  border-bottom-color: var(--border);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}

.nav-inner {
  width: 100%;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.brand-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--gradient);
  box-shadow: 0 0 14px rgba(167, 139, 250, 0.8);
  animation: dot-pulse 2.4s var(--ease-soft) infinite;
}

.brand-text {
  font-size: 1rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 14px;
  font-size: 0.9rem;
  color: var(--text-dim);
  border-radius: 999px;
  transition: color 0.25s var(--ease), background 0.25s var(--ease);
}

.nav-link:hover {
  color: var(--text);
  background: var(--surface);
}

.btn-ghost {
  padding: 8px 18px;
  font-size: 0.88rem;
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  transition: border-color 0.3s var(--ease), background 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.btn-ghost:hover {
  border-color: rgba(167, 139, 250, 0.7);
  background: rgba(167, 139, 250, 0.1);
  transform: translateY(-1px);
}

@keyframes dot-pulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(167, 139, 250, 0.5);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 22px rgba(34, 211, 238, 0.9);
    transform: scale(1.18);
  }
}

/* ====== Hero ====== */
.hero {
  min-height: min(100vh, 920px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
  position: relative;
}

.hero-kicker {
  font-size: 0.74rem;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  color: var(--text-faint);
  margin-bottom: 28px;
  animation: rise 1s var(--ease) both;
}

.hero-title {
  font-size: clamp(2.6rem, 6.4vw, 4.6rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.02em;
  animation: rise 1.1s var(--ease) 0.1s both;
}

.hero-title-sub {
  display: block;
  color: var(--text);
  font-weight: 600;
}

.hero-desc {
  margin-top: 26px;
  font-size: clamp(0.95rem, 1.6vw, 1.12rem);
  color: var(--text-dim);
  letter-spacing: 0.04em;
  animation: rise 1.1s var(--ease) 0.22s both;
}

.hero-stats {
  margin-top: 44px;
  display: flex;
  align-items: center;
  gap: 34px;
  animation: rise 1.1s var(--ease) 0.34s both;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat strong {
  font-size: 1.9rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat span {
  font-size: 0.78rem;
  color: var(--text-faint);
  letter-spacing: 0.16em;
}

.stat-divider {
  width: 1px;
  height: 34px;
  background: var(--border);
}

.scroll-hint {
  position: absolute;
  bottom: 42px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  color: var(--text-faint);
  animation: rise 1.2s var(--ease) 0.5s both;
}

.scroll-hint i {
  display: block;
  width: 1px;
  height: 46px;
  background: linear-gradient(var(--c2), transparent);
  position: relative;
  overflow: hidden;
}

.scroll-hint i::after {
  content: "";
  position: absolute;
  top: -46px;
  left: 0;
  width: 1px;
  height: 20px;
  background: var(--c1);
  animation: scroll-line 2s var(--ease-soft) infinite;
}

@keyframes scroll-line {
  0% {
    top: -20px;
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  100% {
    top: 46px;
    opacity: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(26px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ====== 内容区 ====== */
.content {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 40px 28px 100px;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 36px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter {
  padding: 7px 16px;
  font-size: 0.85rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.28s var(--ease), border-color 0.28s var(--ease),
    background 0.28s var(--ease), transform 0.28s var(--ease);
}

.filter:hover {
  color: var(--text);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.filter.active {
  color: #0a0b12;
  border-color: transparent;
  background: var(--gradient);
  font-weight: 600;
}

/* ====== 卡片 ====== */
.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card {
  position: relative;
  padding: 28px 30px 22px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.5s var(--ease), border-color 0.5s var(--ease),
    box-shadow 0.5s var(--ease), background 0.5s var(--ease);
}

/* 顶部流光 */
.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(167, 139, 250, 0.7),
    transparent
  );
  opacity: 0;
  transition: opacity 0.5s var(--ease);
}

.card:hover {
  transform: translateY(-6px);
  border-color: rgba(167, 139, 250, 0.38);
  background: var(--surface-hover);
  box-shadow: 0 30px 70px -30px rgba(167, 139, 250, 0.5),
    0 0 0 1px rgba(167, 139, 250, 0.08);
}

.card:hover::before {
  opacity: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.76rem;
  color: var(--text-faint);
  margin-bottom: 14px;
}

.tag {
  padding: 3px 11px;
  border-radius: 999px;
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.28);
  color: #c4b5fd;
  letter-spacing: 0.02em;
}

.card-title {
  font-size: 1.28rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.01em;
  margin-bottom: 12px;
  transition: color 0.35s var(--ease);
}

.card:hover .card-title {
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.card-summary {
  font-size: 0.92rem;
  line-height: 1.75;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 4.8em;
}

.card-foot {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 0.78rem;
  color: var(--text-faint);
}

.card-arrow {
  margin-left: auto;
  color: var(--text-dim);
  transition: transform 0.35s var(--ease), color 0.35s var(--ease);
}

.card:hover .card-arrow {
  color: var(--c1);
  transform: translateX(5px);
}

/* ====== 状态 ====== */
.loading {
  padding: 90px 0;
  text-align: center;
  color: var(--text-faint);
  font-size: 0.9rem;
}

.loading-bar {
  display: block;
  width: 180px;
  height: 2px;
  margin: 0 auto 20px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--c1), var(--c2), var(--c3));
  transform-origin: left;
  animation: loading-sweep 1.4s var(--ease-soft) infinite;
}

@keyframes loading-sweep {
  0% {
    transform: scaleX(0.1);
    opacity: 0.5;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
  100% {
    transform: scaleX(0.1);
    opacity: 0.5;
  }
}

.empty {
  padding: 90px 0;
  text-align: center;
  color: var(--text-faint);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 12px;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ====== 加载更多 ====== */
.more {
  margin-top: 42px;
  text-align: center;
}

.btn-more {
  padding: 13px 38px;
  border-radius: 999px;
  font-size: 0.9rem;
  color: var(--text);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  transition: border-color 0.35s var(--ease), background 0.35s var(--ease),
    transform 0.35s var(--ease), box-shadow 0.35s var(--ease);
}

.btn-more:hover {
  border-color: rgba(34, 211, 238, 0.6);
  background: rgba(34, 211, 238, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 16px 40px -18px rgba(34, 211, 238, 0.7);
}

.list-end {
  margin-top: 42px;
  text-align: center;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  color: var(--text-faint);
}

/* ====== 页脚 ====== */
.footer {
  border-top: 1px solid var(--border);
  padding: 34px 24px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-faint);
  letter-spacing: 0.04em;
}

/* ====== 响应式 ====== */
@media (max-width: 860px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .content {
    padding: 30px 20px 80px;
  }
  .section-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
  .hero {
    padding: 110px 20px 70px;
  }
  .hero-stats {
    gap: 24px;
  }
  .nav-inner {
    padding: 0 18px;
  }
}
</style>
