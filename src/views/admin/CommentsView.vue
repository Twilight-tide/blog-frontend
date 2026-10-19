<template>
  <div class="comments-view">
    <div class="toolbar">
      <p class="hint">全站评论按时间倒序排列，删除后无法恢复。</p>
      <button class="btn-ghost" type="button" @click="load">刷新</button>
    </div>

    <div class="table-card">
      <el-table :data="rows" v-loading="loading" class="table">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="文章" min-width="170">
          <template #default="{ row }">
            <a
              class="article-link"
              :href="`/article/${row.articleId}`"
              target="_blank"
              rel="noopener"
            >{{ row.articleTitle || `文章 #${row.articleId}` }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="评论者" width="120" />
        <el-table-column prop="content" label="内容" min-width="260">
          <template #default="{ row }">
            <span class="content">{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="150">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <button class="btn-mini danger" type="button" @click="remove(row)">删除</button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          :current-page="page"
          :page-size="size"
          :total="total"
          layout="prev, pager, next, total"
          background
          @current-change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getAdminComments, deleteAdminComment } from "../../api/admin";

const rows = ref([]);
const loading = ref(false);
const page = ref(1);
const size = ref(10);
const total = ref(0);

const load = async () => {
  loading.value = true;
  try {
    const data = await getAdminComments({ page: page.value, size: size.value });
    rows.value = data.list;
    total.value = data.total;
  } catch (error) {
    console.error("加载评论失败", error);
  } finally {
    loading.value = false;
  }
};

const changePage = (value) => {
  page.value = value;
  load();
};

const remove = async (row) => {
  try {
    await ElMessageBox.confirm("确定删除这条评论吗？", "确认删除", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteAdminComment(row.id);
    ElMessage.success("删除成功");
    load();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "删除失败");
    }
  }
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(load);
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.hint {
  font-size: 0.78rem;
  color: var(--text-faint);
}

.table-card {
  padding: 6px 10px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-soft);
  box-shadow: var(--card-shadow);
}

.article-link {
  color: var(--text-strong);
  border-bottom: 1px dashed transparent;
}

.article-link:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-dim);
  line-height: 1.55;
}

.btn-ghost {
  padding: 8px 18px;
  font-size: 0.8rem;
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  transition: border-color 0.25s var(--ease), color 0.25s var(--ease);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-mini {
  padding: 5px 11px;
  font-size: 0.72rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.25s var(--ease), border-color 0.25s var(--ease);
}

.btn-mini.danger:hover {
  color: #c4453d;
  border-color: #c4453d;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 16px 6px 0;
}

:deep(.table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: var(--surface);
  --el-table-border-color: var(--border);
  --el-table-text-color: var(--text-dim);
  --el-table-header-text-color: var(--text-dim);
  --el-table-row-hover-bg-color: var(--surface);
  background: transparent;
}

:deep(.table .el-table__cell) {
  padding: 9px 0;
}
</style>
