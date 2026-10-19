<template>
  <div class="dashboard">
    <div class="stats" v-loading="loading">
      <div v-for="card in cards" :key="card.label" class="stat-card">
        <span class="stat-label">{{ card.label }}</span>
        <strong class="stat-value">{{ card.value }}</strong>
        <span class="stat-hint">{{ card.hint }}</span>
      </div>
    </div>

    <div class="panels">
      <section class="panel">
        <h2 class="panel-title">快捷操作</h2>
        <div class="quick">
          <RouterLink to="/admin/users" class="quick-item">
            <el-icon><User /></el-icon>
            <div>
              <strong>账号管理</strong>
              <p>把读者升级为作者，或封禁捣乱账号</p>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </RouterLink>
          <RouterLink to="/admin/articles" class="quick-item">
            <el-icon><Document /></el-icon>
            <div>
              <strong>文章管理</strong>
              <p>下架、删除任意文章</p>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </RouterLink>
          <RouterLink to="/admin/comments" class="quick-item">
            <el-icon><ChatDotRound /></el-icon>
            <div>
              <strong>评论管理</strong>
              <p>清理不合适的内容</p>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </RouterLink>
          <RouterLink to="/author" class="quick-item">
            <el-icon><EditPen /></el-icon>
            <div>
              <strong>写文章</strong>
              <p>进入作者中心发布新文章</p>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </RouterLink>
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">站点概况</h2>
        <dl class="detail-list">
          <div><dt>已发布文章</dt><dd>{{ stats.publishedArticles ?? 0 }} / {{ stats.articles ?? 0 }}</dd></div>
          <div><dt>授权作者</dt><dd>{{ stats.authors ?? 0 }}</dd></div>
          <div><dt>管理员</dt><dd>{{ stats.admins ?? 0 }}</dd></div>
          <div><dt>被封禁账号</dt><dd>{{ stats.disabledUsers ?? 0 }}</dd></div>
          <div><dt>评论总数</dt><dd>{{ stats.comments ?? 0 }}</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { getStats } from "../../api/admin";

const stats = ref({});
const loading = ref(false);

const cards = computed(() => [
  { label: "用户总数", value: stats.value.users ?? 0, hint: "含管理员与读者" },
  { label: "文章", value: stats.value.articles ?? 0, hint: "含已下架" },
  { label: "评论", value: stats.value.comments ?? 0, hint: "全站" },
  { label: "作者", value: stats.value.authors ?? 0, hint: "可发布文章" },
]);

const load = async () => {
  loading.value = true;
  try {
    stats.value = await getStats();
  } catch (error) {
    console.error("加载统计失败", error);
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  min-height: 120px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 22px 22px 18px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-soft);
  box-shadow: var(--card-shadow);
}

.stat-label {
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--text-faint);
}

.stat-value {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.1;
  color: var(--text-strong);
}

.stat-hint {
  font-size: 0.7rem;
  color: var(--text-faint);
}

.panels {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-top: 20px;
}

.panel {
  padding: 24px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-soft);
  box-shadow: var(--card-shadow);
}

.panel-title {
  margin-bottom: 16px;
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-strong);
}

.quick {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  color: var(--text-dim);
  transition: background 0.25s var(--ease), border-color 0.25s var(--ease);
}

.quick-item:hover {
  background: var(--surface);
  border-color: var(--border);
}

.quick-item > .el-icon {
  font-size: 18px;
  color: var(--accent);
  flex-shrink: 0;
}

.quick-item > div {
  flex: 1;
  min-width: 0;
}

.quick-item strong {
  display: block;
  font-size: 0.86rem;
  color: var(--text-strong);
}

.quick-item p {
  margin-top: 2px;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.arrow {
  color: var(--text-faint);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border);
}

.detail-list > div:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

dt {
  font-size: 0.8rem;
  color: var(--text-dim);
}

dd {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-strong);
}

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .panels {
    grid-template-columns: 1fr;
  }
}
</style>
