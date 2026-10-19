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
          <template v-if="!auth.isLoggedIn">
            <button class="btn-ghost" @click="goLogin">登录</button>
          </template>
          <template v-else>
            <button v-if="auth.canPublish" class="btn-ghost" @click="goWorkspace">
              {{ auth.isAdmin ? "管理后台" : "作者中心" }}
            </button>
            <button class="btn-ghost" @click="goLogout">退出</button>
          </template>
        </nav>
      </div>
    </header>

    <!-- ====== Hero ====== -->
    <section class="hero">
      <p class="hero-kicker">TWILIGHT · BLOG</p>

      <h1 class="hero-title">
        <span class="hero-name">晓升汐落</span>
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
      <div class="section-head">
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
import { ElMessage } from "element-plus";
import { getArticleList } from "../api/article";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const auth = useAuthStore();
const articles = ref([]);
const loading = ref(true);
const selectedCategory = ref("");
const pageSize = ref(5);
const currentPage = ref(1);
const scrolled = ref(false);
const year = new Date().getFullYear();

let observer = null;

const categories = computed(() => {
  const set = new Set();
  articles.value.forEach((a) => {
    if (a.category) set.add(a.category);
  });
  return Array.from(set);
});

const filteredByCategory = computed(() => {
  if (!selectedCategory.value) return articles.value;
  return articles.value.filter((a) => a.category === selectedCategory.value);
});

const displayArticles = computed(() => {
  return filteredByCategory.value.slice(0, currentPage.value * pageSize.value);
});

const isLoggedIn = computed(() => auth.isLoggedIn);

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

const loadMore = () => {
  currentPage.value++;
  requestAnimationFrame(observeReveals);
};

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

const goWorkspace = () => {
  router.push(auth.isAdmin ? "/admin/dashboard" : "/author");
};

const goLogout = () => {
  auth.clear();
  ElMessage.success("已退出");
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
  background: var(--nav-bg);
  border-bottom-color: var(--border);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
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
  color: var(--text-strong);
}

.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
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
  color: var(--text-strong);
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
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

/* ====== Hero ====== */
.hero {
  min-height: min(100vh, 900px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
  position: relative;
}

.hero-kicker {
  font-size: 0.72rem;
  letter-spacing: 0.44em;
  text-indent: 0.44em;
  color: var(--text-faint);
  margin-bottom: 30px;
  animation: rise 1s var(--ease) both;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 6vw, 4.3rem);
  font-weight: 600;
  line-height: 1.14;
  letter-spacing: 0.02em;
  animation: rise 1.1s var(--ease) 0.1s both;
}

.hero-name {
  color: var(--accent);
}

.hero-title-sub {
  display: block;
  color: var(--text-strong);
}

.hero-desc {
  margin-top: 26px;
  font-size: clamp(0.94rem, 1.5vw, 1.06rem);
  color: var(--text-dim);
  letter-spacing: 0.06em;
  animation: rise 1.1s var(--ease) 0.22s both;
}

.hero-stats {
  margin-top: 46px;
  display: flex;
  align-items: center;
  gap: 34px;
  animation: rise 1.1s var(--ease) 0.34s both;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat strong {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.stat span {
  font-size: 0.76rem;
  color: var(--text-faint);
  letter-spacing: 0.18em;
}

.stat-divider {
  width: 1px;
  height: 32px;
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
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  color: var(--text-faint);
  animation: rise 1.2s var(--ease) 0.5s both;
}

.scroll-hint i {
  display: block;
  width: 1px;
  height: 46px;
  background: linear-gradient(var(--border-strong), transparent);
  position: relative;
  overflow: hidden;
}

.scroll-hint i::after {
  content: "";
  position: absolute;
  top: -20px;
  left: 0;
  width: 1px;
  height: 18px;
  background: var(--accent);
  animation: scroll-line 2.2s var(--ease-soft) infinite;
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
    transform: translateY(24px);
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
  margin-bottom: 34px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-family: var(--font-serif);
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-strong);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter {
  padding: 7px 16px;
  font-size: 0.84rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.28s var(--ease), border-color 0.28s var(--ease),
    background 0.28s var(--ease), transform 0.28s var(--ease);
}

.filter:hover {
  color: var(--text-strong);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.filter.active {
  color: var(--accent-ink);
  border-color: transparent;
  background: var(--accent);
  font-weight: 600;
}

/* ====== 卡片 ====== */
.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.card {
  position: relative;
  padding: 26px 28px 20px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-soft);
  cursor: pointer;
  transition: transform 0.45s var(--ease), border-color 0.45s var(--ease),
    box-shadow 0.45s var(--ease);
  box-shadow: var(--card-shadow);
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
  box-shadow: var(--card-shadow-hover);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-faint);
  margin-bottom: 14px;
}

.tag {
  padding: 3px 11px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--accent);
  letter-spacing: 0.02em;
}

.card-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0.01em;
  color: var(--text-strong);
  margin-bottom: 12px;
  transition: color 0.3s var(--ease);
}

.card:hover .card-title {
  color: var(--accent);
}

.card-summary {
  font-size: 0.9rem;
  line-height: 1.78;
  color: var(--text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 4.8em;
}

.card-foot {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 0.76rem;
  color: var(--text-faint);
}

.card-arrow {
  margin-left: auto;
  color: var(--text-dim);
  transition: transform 0.35s var(--ease), color 0.35s var(--ease);
}

.card:hover .card-arrow {
  color: var(--accent);
  transform: translateX(4px);
}

/* ====== 状态 ====== */
.loading {
  padding: 90px 0;
  text-align: center;
  color: var(--text-faint);
  font-size: 0.88rem;
}

.loading-bar {
  display: block;
  width: 160px;
  height: 1px;
  margin: 0 auto 20px;
  background: var(--accent);
  transform-origin: left;
  animation: loading-sweep 1.4s var(--ease-soft) infinite;
}

@keyframes loading-sweep {
  0% {
    transform: scaleX(0.12);
    opacity: 0.4;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
  100% {
    transform: scaleX(0.12);
    opacity: 0.4;
  }
}

.empty {
  padding: 90px 0;
  text-align: center;
  color: var(--text-faint);
}

.empty-icon {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: var(--accent);
}

/* ====== 加载更多 ====== */
.more {
  margin-top: 40px;
  text-align: center;
}

.btn-more {
  padding: 12px 36px;
  border-radius: 999px;
  font-size: 0.88rem;
  color: var(--text);
  border: 1px solid var(--border-strong);
  transition: border-color 0.35s var(--ease), color 0.35s var(--ease),
    transform 0.35s var(--ease);
}

.btn-more:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

.list-end {
  margin-top: 40px;
  text-align: center;
  font-size: 0.76rem;
  letter-spacing: 0.22em;
  color: var(--text-faint);
}

/* ====== 页脚 ====== */
.footer {
  border-top: 1px solid var(--border);
  padding: 32px 24px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-faint);
  letter-spacing: 0.06em;
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
