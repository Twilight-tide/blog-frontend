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

      <!-- ====== 评论区域 ====== -->
      <div class="comment-section" v-if="article">
        <h3>💬 评论（{{ comments.length }}）</h3>

        <!-- 发表评论 -->
        <div v-if="isLoggedIn" class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
          />
          <el-button
            type="primary"
            :loading="submitting"
            @click="submitComment"
            style="margin-top: 12px"
          >
            发表评论
          </el-button>
        </div>
        <p v-else class="login-tip">请 <a href="/login">登录</a> 后发表评论</p>

        <!-- 评论列表 -->
        <div class="comment-list">
          <div v-for="item in comments" :key="item.id" class="comment-item">
            <div class="comment-user">
              <strong>{{ getCommentUser(item) }}</strong>
              <span class="comment-date">{{
                formatDate(item.createTime)
              }}</span>
              <el-button
                v-if="canDelete(item)"
                type="danger"
                size="small"
                @click="handleDeleteComment(item.id)"
                style="margin-left: 12px"
              >
                删除
              </el-button>
            </div>
            <div class="comment-content">{{ item.content }}</div>
          </div>
          <div v-if="comments.length === 0" class="no-comment">
            还没有评论，来说两句吧～
          </div>
        </div>
      </div>

      <!-- 文章不存在 -->
      <div v-else class="empty">文章不存在或已被删除</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getArticleDetail } from "../api/article";
import {
  getCommentList,
  publishComment,
  deleteComment as apiDeleteComment,
} from "../api/comment";
import { marked } from "marked";

const route = useRoute();
const router = useRouter();

// ====== 文章相关 ======
const article = ref(null);
const loading = ref(true);

// ====== 评论相关 ======
const comments = ref([]);
const newComment = ref("");
const submitting = ref(false);

// 是否已登录
const isLoggedIn = computed(() => {
  return !!localStorage.getItem("token");
});

// 获取评论用户显示名
const getCommentUser = (item) => {
  return item.userId === 1 ? "晓升汐落" : "用户" + item.userId;
};

// 判断是否可以删除评论（博主 或 评论作者本人）
const canDelete = (item) => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  return item.userId === 1;
};

// ====== 获取文章 ======
const fetchArticle = async () => {
  try {
    loading.value = true;
    const id = route.params.id;
    article.value = await getArticleDetail(id);
    if (article.value) {
      await fetchComments();
    }
  } catch (error) {
    console.error("获取文章详情失败:", error);
    article.value = null;
  } finally {
    loading.value = false;
  }
};

// ====== 获取评论列表 ======
const fetchComments = async () => {
  try {
    const id = route.params.id;
    comments.value = await getCommentList(id);
  } catch (error) {
    console.error("获取评论列表失败:", error);
    comments.value = [];
  }
};

// ====== 发表评论 ======
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }

  submitting.value = true;
  try {
    const data = {
      articleId: parseInt(route.params.id),
      content: newComment.value.trim(),
      parentId: 0,
    };
    await publishComment(data);
    ElMessage.success("评论发表成功！");
    newComment.value = "";
    await fetchComments();
  } catch (error) {
    ElMessage.error(error.message || "评论发表失败");
  } finally {
    submitting.value = false;
  }
};

// ====== 删除评论（改名避免冲突） ======
const handleDeleteComment = async (id) => {
  try {
    await apiDeleteComment(id);
    ElMessage.success("评论删除成功");
    await fetchComments();
  } catch (error) {
    ElMessage.error(error.message || "删除失败");
  }
};

// ====== 工具方法 ======
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

/* ===== 评论样式 ===== */
.comment-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #ecf0f1;
}

.comment-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.comment-form {
  margin-bottom: 24px;
}

.login-tip {
  color: #95a5a6;
  font-size: 0.95rem;
  margin-bottom: 20px;
}

.login-tip a {
  color: #667eea;
  text-decoration: none;
}

.login-tip a:hover {
  text-decoration: underline;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px 20px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.comment-user strong {
  color: #2c3e50;
}

.comment-date {
  font-size: 0.8rem;
  color: #95a5a6;
}

.comment-content {
  color: #34495e;
  line-height: 1.6;
}

.no-comment {
  text-align: center;
  color: #95a5a6;
  padding: 20px 0;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 0;
  color: #95a5a6;
}
</style>
