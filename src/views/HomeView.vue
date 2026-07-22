<template>
  <div class="home">
    <header class="header">
      <div class="header-content">
        <div>
          <h1>晓升汐落的技术博客</h1>
          <p>记录技术成长，分享编程思考</p>
        </div>
        <el-button
          v-if="isLoggedIn"
          type="primary"
          size="small"
          @click="goToAdmin"
          style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
          "
        >
          管理后台
        </el-button>
      </div>
    </header>

    <div class="container">
      <!-- 分类筛选 -->
      <div class="filter-bar">
        <el-button
          :type="selectedCategory === '' ? 'primary' : ''"
          @click="filterByCategory('')"
        >
          全部
        </el-button>
        <el-button
          v-for="cat in categories"
          :key="cat"
          :type="selectedCategory === cat ? 'primary' : ''"
          @click="filterByCategory(cat)"
        >
          {{ cat }}
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">加载中...</div>

      <!-- 文章列表 -->
      <div v-else-if="displayArticles.length > 0" class="article-list">
        <div
          v-for="article in displayArticles"
          :key="article.id"
          class="article-item"
          @click="goToDetail(article.id)"
        >
          <h2 class="title">{{ article.title }}</h2>
          <p class="summary">
            {{ article.summary || article.content?.slice(0, 150) + "..." }}
          </p>
          <div class="meta">
            <span class="category">{{ article.category || "未分类" }}</span>
            <span class="date">{{ formatDate(article.createTime) }}</span>
            <span class="views">👁 {{ article.viewCount }}</span>
            <span class="likes">❤ {{ article.likeCount }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty">暂无文章</div>

      <!-- 分页 -->
      <div v-if="!loading && filteredByCategory.length > 0" class="pagination">
        <el-button
          v-if="displayArticles.length < filteredByCategory.length"
          @click="loadMore"
        >
          加载更多
        </el-button>
        <span v-else class="end">— 已全部加载 —</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getArticleList } from "../api/article";

const router = useRouter();
const articles = ref([]);
const loading = ref(true);
const selectedCategory = ref("");
const pageSize = ref(5);
const currentPage = ref(1);

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

// 加载更多
const loadMore = () => {
  currentPage.value++;
};

// 筛选分类（重置分页）
const filterByCategory = (cat) => {
  selectedCategory.value = cat;
  currentPage.value = 1; // 切换分类时重置页码
};

const fetchArticles = async () => {
  try {
    loading.value = true;
    articles.value = await getArticleList();
  } catch (error) {
    console.error("获取文章列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const goToDetail = (id) => {
  router.push(`/article/${id}`);
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

onMounted(() => {
  fetchArticles();
});
// 在 script setup 中添加
const isLoggedIn = computed(() => !!localStorage.getItem("token"));

const goToAdmin = () => {
  router.push("/admin");
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  background: white;
  border-radius: 12px;
  padding: 24px 28px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.article-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.article-item .title {
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.article-item .summary {
  color: #6b7a8f;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-item .meta {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #95a5a6;
}

.article-item .meta .category {
  background: #ecf0f1;
  padding: 2px 12px;
  border-radius: 20px;
  color: #7f8c8d;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 0;
  color: #95a5a6;
}

.pagination {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.pagination .end {
  color: #95a5a6;
  font-size: 0.9rem;
}
.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
