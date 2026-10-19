<template>
  <div class="detail">
    <!-- 阅读进度条 -->
    <div class="progress"><i :style="{ transform: `scaleX(${progress})` }"></i></div>

    <button class="back-float" @click="goBack" aria-label="返回">←</button>

    <div class="container">
      <div v-if="loading" class="state">正在加载…</div>

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
import { useAuthStore } from "../store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const article = ref(null);
const loading = ref(true);
const comments = ref([]);
const newComment = ref("");
const submitting = ref(false);
const progress = ref(0);

const isLoggedIn = computed(() => auth.isLoggedIn);

const getCommentUser = (item) => {
  if (auth.userId && item.userId === auth.userId) return "我";
  return "用户" + item.userId;
};

const canDelete = (item) => {
  if (!auth.isLoggedIn) return false;
  // 管理员可删任意评论，其他用户只能删自己的
  return auth.isAdmin || item.userId === auth.userId;
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
  background: var(--accent);
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 0.12s linear;
}

.back-float {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%) translateX(-540px);
  z-index: 150;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.05rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: color 0.3s var(--ease), border-color 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.back-float:hover {
  color: var(--accent);
  border-color: var(--accent);
  transform: translateX(-50%) translateX(-540px) translateY(-2px);
}

.container {
  max-width: 760px;
  margin: 0 auto;
  padding: 96px 28px 0;
}

.head {
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 44px;
  animation: rise 0.9s var(--ease) both;
}

.head-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 0.76rem;
  color: var(--text-faint);
}

.tag {
  padding: 3px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--accent);
}

.sep {
  width: 18px;
  height: 1px;
  background: var(--border);
}

.title {
  font-family: var(--font-serif);
  font-size: clamp(1.85rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.01em;
  color: var(--text-strong);
  margin-bottom: 20px;
}

.meta {
  display: flex;
  gap: 22px;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.content {
  font-size: 1.04rem;
  line-height: 1.92;
  color: var(--text);
  animation: rise 1s var(--ease) 0.12s both;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4) {
  font-family: var(--font-serif);
  color: var(--text-strong);
  font-weight: 600;
  line-height: 1.4;
  margin: 2.1em 0 0.85em;
}

.content :deep(h1) {
  font-size: 1.7rem;
}
.content :deep(h2) {
  font-size: 1.4rem;
  padding-bottom: 0.32em;
  border-bottom: 1px solid var(--border);
}
.content :deep(h3) {
  font-size: 1.18rem;
}

.content :deep(p) {
  margin: 1.1em 0;
}

.content :deep(a) {
  color: var(--accent);
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
}

.content :deep(a:hover) {
  border-bottom-color: var(--accent);
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
  color: var(--accent);
}

.content :deep(blockquote) {
  margin: 1.5em 0;
  padding: 14px 20px;
  border-left: 2px solid var(--accent);
  background: var(--surface);
  border-radius: 0 10px 10px 0;
  color: var(--text-dim);
}

.content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88em;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  color: var(--text-strong);
}

.content :deep(pre) {
  margin: 1.5em 0;
  padding: 20px 22px;
  border-radius: 12px;
  background: var(--code-bg);
  border: 1px solid var(--border);
  overflow-x: auto;
}

.content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.86rem;
  line-height: 1.75;
  color: var(--text-dim);
}

.content :deep(img) {
  margin: 1.6em auto;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.content :deep(table) {
  width: 100%;
  margin: 1.5em 0;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.content :deep(th),
.content :deep(td) {
  padding: 10px 14px;
  border: 1px solid var(--border);
  text-align: left;
}

.content :deep(th) {
  background: var(--surface);
  color: var(--text-strong);
  font-weight: 600;
}

.content :deep(hr) {
  margin: 2.4em 0;
  border: none;
  height: 1px;
  background: var(--border);
}

.article-foot {
  margin-top: 54px;
  padding-top: 26px;
  border-top: 1px solid var(--border);
}

.btn-line {
  padding: 11px 26px;
  border-radius: 999px;
  font-size: 0.86rem;
  color: var(--text-dim);
  border: 1px solid var(--border-strong);
  transition: color 0.3s var(--ease), border-color 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.btn-line:hover {
  color: var(--accent);
  border-color: var(--accent);
  transform: translateX(-3px);
}

/* ====== 评论 ====== */
.comments {
  margin-top: 68px;
  padding-top: 38px;
  border-top: 1px solid var(--border);
  animation: rise 1s var(--ease) 0.24s both;
}

.comments-title {
  font-family: var(--font-serif);
  font-size: 1.12rem;
  font-weight: 600;
  margin-bottom: 22px;
  color: var(--text-strong);
}

.count {
  margin-left: 6px;
  font-size: 0.82rem;
  color: var(--accent);
}

.comment-form {
  margin-bottom: 32px;
}

.comment-form textarea {
  width: 100%;
  padding: 15px 17px;
  border-radius: 12px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: inherit;
  font-size: 0.93rem;
  line-height: 1.7;
  resize: vertical;
  transition: border-color 0.3s var(--ease);
  outline: none;
}

.comment-form textarea::placeholder {
  color: var(--text-faint);
}

.comment-form textarea:focus {
  border-color: var(--accent);
}

.form-foot {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.btn-send {
  padding: 10px 26px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--accent-ink);
  background: var(--accent);
  transition: transform 0.3s var(--ease), opacity 0.3s var(--ease);
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.92;
}

.btn-send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.login-tip {
  margin-bottom: 28px;
  font-size: 0.88rem;
  color: var(--text-faint);
}

.login-tip a {
  color: var(--accent);
  cursor: pointer;
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
}

.comment-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  padding: 17px 19px;
  border-radius: 12px;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  transition: border-color 0.3s var(--ease);
}

.comment-item:hover {
  border-color: var(--border-strong);
}

.comment-head {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 9px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--accent-ink);
  background: var(--accent);
  flex-shrink: 0;
}

.comment-who {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.comment-who strong {
  font-size: 0.84rem;
  color: var(--text-strong);
}

.comment-who span {
  font-size: 0.7rem;
  color: var(--text-faint);
}

.btn-del {
  margin-left: auto;
  font-size: 0.74rem;
  color: var(--text-faint);
  padding: 4px 10px;
  border-radius: 999px;
  transition: color 0.3s var(--ease), background 0.3s var(--ease);
}

.btn-del:hover {
  color: #c4453d;
  background: color-mix(in srgb, #c4453d 10%, transparent);
}

.comment-content {
  font-size: 0.9rem;
  line-height: 1.75;
  color: var(--text-dim);
  word-break: break-word;
}

.no-comment {
  padding: 38px 0;
  text-align: center;
  font-size: 0.86rem;
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
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1180px) {
  .back-float {
    transform: translateX(-50%) translateX(-380px);
  }
  .back-float:hover {
    transform: translateX(-50%) translateX(-380px) translateY(-2px);
  }
}

@media (max-width: 860px) {
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
