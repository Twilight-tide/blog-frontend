<template>
  <div class="detail">
    <!-- 阅读进度条 -->
    <div class="progress"><i :style="{ transform: `scaleX(${progress})` }"></i></div>

    <button class="back-float" @click="goBack" aria-label="返回">←</button>

    <div class="container">
      <!-- 加载 -->
      <div v-if="loading" class="state">正在加载…</div>

      <!-- 文章 -->
      <article v-else-if="article" class="article">
        <header class="head">
          <div class="head-top">
            <span class="tag">{{ article.category || "未分类" }}</span>
            <span class="sep"></span>
            <span class="meta-text">{{ formatDate(article.createTime) }}</span>
          </div>

          <h1 class="title">{{ article.title }}</h1>

          <div class="meta">
            <span>👁 {{ article.viewCount }} 次阅读</span>
            <span>❤ {{ article.likeCount }}</span>
          </div>
        </header>

        <div class="content" v-html="renderMarkdown(article.content)"></div>

        <div class="article-foot">
          <button class="btn-line" @click="goBack">← 返回列表</button>
        </div>
      </article>

      <!-- 不存在 -->
      <div v-else class="state">文章不存在或已被删除</div>

      <!-- 评论区 -->
      <section v-if="article" class="comments">
        <h2 class="comments-title">
          评论
          <span class="count">{{ comments.length }}</span>
        </h2>

        <div v-if="isLoggedIn" class="comment-form">
          <textarea
            v-model="newComment"
            rows="3"
            placeholder="写下你的想法…"
          ></textarea>
          <div class="form-foot">
            <button
              class="btn-send"
              :disabled="submitting"
              @click="submitComment"
            >
              {{ submitting ? "发送中…" : "发表评论" }}
            </button>
          </div>
        </div>
        <p v-else class="login-tip">
          请 <a @click="goLogin">登录</a> 后参与讨论
        </p>

        <ul class="comment-list">
          <li v-for="item in comments" :key="item.id" class="comment-item">
            <div class="comment-head">
              <span class="avatar">{{ getCommentUser(item).slice(0, 1) }}</span>
              <div class="comment-who">
                <strong>{{ getCommentUser(item) }}</strong>
                <span>{{ formatDate(item.createTime) }}</span>
              </div>
              <button
                v-if="canDelete(item)"
                class="btn-del"
                @click="handleDeleteComment(item.id)"
              >
                删除
              </button>
            </div>
            <p class="comment-content">{{ item.content }}</p>
          </li>
        </ul>

        <div v-if="!comments.length" class="no-comment">
          还没有评论，来说两句吧
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getArticleDetail } from "../api/article";
import {
  getCommentList,
  publishComment,
  deleteComment as apiDeleteComment,
} from "../api/comment";
import { marked } from "marked";
import DOMPurify from "dompurify";

const route = useRoute();
const router = useRouter();

const article = ref(null);
const loading = ref(true);
const comments = ref([]);
const newComment = ref("");
const submitting = ref(false);
const progress = ref(0);

const isLoggedIn = computed(() => !!localStorage.getItem("token"));

const getCommentUser = (item) => {
  return item.userId === 1 ? "晓升汐落" : "用户" + item.userId;
};

const canDelete = (item) => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  return item.userId === 1;
};

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

const fetchComments = async () => {
  try {
    const id = route.params.id;
    comments.value = await getCommentList(id);
  } catch (error) {
    console.error("获取评论列表失败:", error);
    comments.value = [];
  }
};

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

const handleDeleteComment = async (id) => {
  try {
    await apiDeleteComment(id);
    ElMessage.success("评论删除成功");
    await fetchComments();
  } catch (error) {
    ElMessage.error(error.message || "删除失败");
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

const renderMarkdown = (content) => {
  if (!content) return "";
  return DOMPurify.sanitize(marked(content));
};

const goBack = () => {
  router.push("/");
};

const goLogin = () => {
  router.push("/login");
};

const onScroll = () => {
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  progress.value = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
};

onMounted(() => {
  fetchArticle();
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped>
.detail {
  min-height: 100vh;
  padding-bottom: 80px;
}

/* 阅读进度 */
.progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 200;
}

.progress i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #22d3ee, #a78bfa, #f472b6);
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.12s linear;
}

/* 浮动返回 */
.back-float {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%) translateX(-560px);
  z-index: 150;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.05rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  background: rgba(7, 8, 13, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: color 0.3s var(--ease), border-color 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.back-float:hover {
  color: var(--text);
  border-color: var(--border-strong);
  transform: translateX(-50%) translateX(-560px) translateY(-2px);
}

.container {
  max-width: 780px;
  margin: 0 auto;
  padding: 96px 28px 0;
}

/* ====== 文章头 ====== */
.head {
  padding-bottom: 34px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 44px;
  animation: rise 0.9s var(--ease) both;
}

.head-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 0.78rem;
  color: var(--text-faint);
}

.tag {
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.3);
  color: #c4b5fd;
}

.sep {
  width: 18px;
  height: 1px;
  background: var(--border);
}

.title {
  font-size: clamp(1.9rem, 4vw, 2.9rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: #f2f4fb;
  margin-bottom: 20px;
}

.meta {
  display: flex;
  gap: 22px;
  font-size: 0.82rem;
  color: var(--text-faint);
}

/* ====== 正文排版 ====== */
.content {
  font-size: 1.04rem;
  line-height: 1.92;
  color: #d3d7e6;
  animation: rise 1s var(--ease) 0.12s both;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4) {
  color: #f2f4fb;
  font-weight: 650;
  line-height: 1.4;
  margin: 2.2em 0 0.9em;
  letter-spacing: -0.01em;
}

.content :deep(h1) {
  font-size: 1.75rem;
}
.content :deep(h2) {
  font-size: 1.45rem;
  padding-bottom: 0.35em;
  border-bottom: 1px solid var(--border);
}
.content :deep(h3) {
  font-size: 1.2rem;
}

.content :deep(p) {
  margin: 1.1em 0;
}

.content :deep(a) {
  color: var(--c1);
  border-bottom: 1px solid rgba(34, 211, 238, 0.35);
  transition: border-color 0.3s var(--ease);
}
.content :deep(a:hover) {
  border-bottom-color: var(--c1);
}

.content :deep(ul),
.content :deep(ol) {
  margin: 1.1em 0;
  padding-left: 1.4em;
}

.content :deep(li) {
  margin: 0.45em 0;
}

.content :deep(li::marker) {
  color: var(--c2);
}

.content :deep(blockquote) {
  margin: 1.5em 0;
  padding: 14px 20px;
  border-left: 2px solid transparent;
  border-image: linear-gradient(180deg, #22d3ee, #a78bfa) 1;
  background: rgba(167, 139, 250, 0.06);
  border-radius: 0 12px 12px 0;
  color: var(--text-dim);
}

.content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--border);
  color: #e6d5ff;
}

.content :deep(pre) {
  margin: 1.5em 0;
  padding: 20px 22px;
  border-radius: 14px;
  background: #0c0e16;
  border: 1px solid var(--border);
  overflow-x: auto;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.86rem;
  line-height: 1.75;
  color: #c9cede;
}

.content :deep(img) {
  margin: 1.6em auto;
  border-radius: 14px;
  border: 1px solid var(--border);
}

.content :deep(table) {
  width: 100%;
  margin: 1.5em 0;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.content :deep(th),
.content :deep(td) {
  padding: 10px 14px;
  border: 1px solid var(--border);
  text-align: left;
}

.content :deep(th) {
  background: rgba(255, 255, 255, 0.04);
  color: #f0f2fa;
  font-weight: 600;
}

.content :deep(hr) {
  margin: 2.5em 0;
  border: none;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--border-strong),
    transparent
  );
}

/* ====== 文章底部 ====== */
.article-foot {
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--border);
}

.btn-line {
  padding: 11px 26px;
  border-radius: 999px;
  font-size: 0.88rem;
  color: var(--text-dim);
  border: 1px solid var(--border-strong);
  transition: color 0.3s var(--ease), border-color 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.btn-line:hover {
  color: var(--text);
  border-color: rgba(167, 139, 250, 0.6);
  transform: translateX(-3px);
}

/* ====== 评论 ====== */
.comments {
  margin-top: 72px;
  padding-top: 40px;
  border-top: 1px solid var(--border);
  animation: rise 1s var(--ease) 0.24s both;
}

.comments-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #f0f2fa;
}

.count {
  margin-left: 6px;
  font-size: 0.85rem;
  color: var(--c2);
}

.comment-form {
  margin-bottom: 34px;
}

.comment-form textarea {
  width: 100%;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: inherit;
  font-size: 0.94rem;
  line-height: 1.7;
  resize: vertical;
  transition: border-color 0.3s var(--ease), background 0.3s var(--ease);
  outline: none;
}

.comment-form textarea::placeholder {
  color: var(--text-faint);
}

.comment-form textarea:focus {
  border-color: rgba(167, 139, 250, 0.6);
  background: rgba(255, 255, 255, 0.05);
}

.form-foot {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.btn-send {
  padding: 10px 26px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0a0b12;
  background: var(--gradient);
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease),
    opacity 0.3s var(--ease);
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px -16px rgba(167, 139, 250, 0.8);
}

.btn-send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.login-tip {
  margin-bottom: 30px;
  font-size: 0.9rem;
  color: var(--text-faint);
}

.login-tip a {
  color: var(--c1);
  cursor: pointer;
  border-bottom: 1px solid rgba(34, 211, 238, 0.35);
}

.comment-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.comment-item {
  padding: 18px 20px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: border-color 0.35s var(--ease), background 0.35s var(--ease);
}

.comment-item:hover {
  border-color: var(--border-strong);
  background: var(--surface-hover);
}

.comment-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #0a0b12;
  background: var(--gradient);
  flex-shrink: 0;
}

.comment-who {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.comment-who strong {
  font-size: 0.86rem;
  color: #eef0f8;
}

.comment-who span {
  font-size: 0.72rem;
  color: var(--text-faint);
}

.btn-del {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-faint);
  padding: 4px 10px;
  border-radius: 999px;
  transition: color 0.3s var(--ease), background 0.3s var(--ease);
}

.btn-del:hover {
  color: #fda4af;
  background: rgba(244, 114, 182, 0.1);
}

.comment-content {
  font-size: 0.92rem;
  line-height: 1.75;
  color: var(--text-dim);
  word-break: break-word;
}

.no-comment {
  padding: 40px 0;
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-faint);
}

.state {
  padding: 120px 0;
  text-align: center;
  color: var(--text-faint);
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

/* ====== 响应式 ====== */
@media (max-width: 1200px) {
  .back-float {
    transform: translateX(-50%) translateX(-380px);
  }
  .back-float:hover {
    transform: translateX(-50%) translateX(-380px) translateY(-2px);
  }
}

@media (max-width: 900px) {
  .back-float {
    left: 20px;
    top: 16px;
    transform: none;
  }
  .back-float:hover {
    transform: translateY(-2px);
  }
  .container {
    padding: 84px 20px 0;
  }
}
</style>
