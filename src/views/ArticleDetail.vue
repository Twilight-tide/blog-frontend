<template>
  <div class="detail">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">加载中...</div>

      <!-- 文章内容 -->
      <article v-else-if="article" class="article">
        <h1 class="title">{{ article.title }}</h1>

        <div class="meta">
          <span class="category">{{ article.category || "未分类" }}</span>
          <span class="date">{{ formatDate(article.createTime) }}</span>
          <span class="views">👁 {{ article.viewCount }}</span>
          <span class="likes">❤ {{ article.likeCount }}</span>
        </div>

        <!-- 使用 marked 渲染 Markdown -->
        <div class="content" v-html="renderMarkdown(article.content)"></div>

        <div class="back">
          <el-button @click="goBack">← 返回列表</el-button>
        </div>
      </article>

      <!-- 文章不存在 -->
      <div v-else class="empty">文章不存在或已被删除</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getArticleDetail } from "../api/article";
import { marked } from "marked";

const route = useRoute();
const router = useRouter();
const article = ref(null);
const loading = ref(true);

const fetchArticle = async () => {
  try {
    loading.value = true;
    const id = route.params.id;
    article.value = await getArticleDetail(id);
  } catch (error) {
    console.error("获取文章详情失败:", error);
    article.value = null;
  } finally {
    loading.value = false;
  }
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

// 使用 marked 渲染 Markdown
const renderMarkdown = (content) => {
  if (!content) return "";
  return marked(content);
};

const goBack = () => {
  router.push("/");
};

onMounted(() => {
  fetchArticle();
});
</script>

<style scoped>
.detail {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 40px 48px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.article .title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 16px;
}

.article .meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #95a5a6;
  padding-bottom: 20px;
  border-bottom: 1px solid #ecf0f1;
  margin-bottom: 24px;
}

.article .meta .category {
  background: #ecf0f1;
  padding: 2px 14px;
  border-radius: 20px;
  color: #7f8c8d;
}

/* ===== Markdown 样式 ===== */
.article .content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #34495e;
}

.article .content h1,
.article .content h2,
.article .content h3 {
  margin-top: 24px;
  margin-bottom: 12px;
  color: #2c3e50;
}

.article .content h1 {
  font-size: 1.8rem;
}
.article .content h2 {
  font-size: 1.5rem;
}
.article .content h3 {
  font-size: 1.2rem;
}

.article .content p {
  margin-bottom: 16px;
}

.article .content ul,
.article .content ol {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article .content li {
  margin-bottom: 6px;
}

.article .content code {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #e74c3c;
}

.article .content pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 16px 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.article .content pre code {
  background: transparent;
  color: inherit;
  padding: 0;
}

.article .content blockquote {
  border-left: 4px solid #667eea;
  padding-left: 16px;
  margin-left: 0;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
}

.article .content img {
  max-width: 100%;
  border-radius: 8px;
  margin: 12px 0;
}

.article .content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.article .content th,
.article .content td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.article .content th {
  background: #f0f2f5;
}

.article .back {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 0;
  color: #95a5a6;
}
</style>
