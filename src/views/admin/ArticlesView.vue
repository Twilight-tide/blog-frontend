<template>
  <div class="articles">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        class="search"
        placeholder="搜索文章标题"
        clearable
        @keyup.enter="search"
        @clear="search"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <el-select v-model="statusFilter" class="status-filter" placeholder="全部状态" @change="search">
        <el-option label="全部状态" value="" />
        <el-option label="已发布" value="true" />
        <el-option label="已下架" value="false" />
      </el-select>

      <button class="btn-ghost" type="button" @click="search">刷新</button>
      <RouterLink to="/author" class="btn-primary">写新文章</RouterLink>
    </div>

    <div class="table-card">
      <el-table :data="rows" v-loading="loading" class="table">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <a
              class="title"
              :href="`/article/${row.id}`"
              target="_blank"
              rel="noopener"
            >{{ row.title }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="110" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">{{ row.category || "—" }}</template>
        </el-table-column>
        <el-table-column label="状态" width="92">
          <template #default="{ row }">
            <span class="status" :class="row.published ? 'on' : 'off'">
              {{ row.published ? "已发布" : "已下架" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览" width="76" />
        <el-table-column label="更新时间" width="150">
          <template #default="{ row }">{{ formatDate(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <button class="btn-mini" type="button" @click="openEdit(row)">编辑</button>
            <button class="btn-mini" type="button" @click="togglePublished(row)">
              {{ row.published ? "下架" : "上架" }}
            </button>
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑文章" width="820px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="70px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="如：技术分享" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div class="editor-wrap">
            <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" mode="simple" class="editor-toolbar" />
            <Editor
              v-model="form.content"
              :defaultConfig="editorConfig"
              mode="simple"
              class="editor-body"
              @onCreated="handleEditorCreated"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="btn-ghost" type="button" @click="dialogVisible = false">取消</button>
        <button class="btn-primary" type="button" :disabled="saving" @click="save">
          {{ saving ? "保存中…" : "保存修改" }}
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css";
import {
  getAdminArticles,
  getAdminArticle,
  updateArticlePublished,
  deleteAdminArticle,
} from "../../api/admin";
import { updateArticle } from "../../api/article";

const rows = ref([]);
const loading = ref(false);
const saving = ref(false);
const keyword = ref("");
const statusFilter = ref("");
const page = ref(1);
const size = ref(10);
const total = ref(0);

const dialogVisible = ref(false);
const formRef = ref(null);
const currentId = ref(null);
const editorRef = ref(null);
const form = reactive({ title: "", category: "", summary: "", content: "" });

const toolbarConfig = {};
const editorConfig = { placeholder: "请输入文章内容..." };

const rules = {
  title: [{ required: true, message: "请输入文章标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入文章内容", trigger: "blur" }],
};

const load = async () => {
  loading.value = true;
  try {
    const data = await getAdminArticles({
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
      published: statusFilter.value === "" ? undefined : statusFilter.value,
    });
    rows.value = data.list;
    total.value = data.total;
  } catch (error) {
    console.error("加载文章失败", error);
  } finally {
    loading.value = false;
  }
};

const search = () => {
  page.value = 1;
  load();
};

const changePage = (value) => {
  page.value = value;
  load();
};

const handleEditorCreated = (editor) => {
  editorRef.value = editor;
};

const openEdit = async (row) => {
  try {
    const article = await getAdminArticle(row.id);
    currentId.value = row.id;
    form.title = article.title || "";
    form.category = article.category || "";
    form.summary = article.summary || "";
    form.content = article.content || "";
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error(error.message || "加载文章内容失败");
  }
};

const save = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      await updateArticle(currentId.value, form);
      ElMessage.success("已保存");
      dialogVisible.value = false;
      load();
    } catch (error) {
      ElMessage.error(error.message || "保存失败");
    } finally {
      saving.value = false;
    }
  });
};

const togglePublished = async (row) => {
  try {
    await updateArticlePublished(row.id, !row.published);
    row.published = !row.published;
    ElMessage.success(row.published ? "已重新上架" : "已下架");
  } catch (error) {
    ElMessage.error(error.message || "操作失败");
  }
};

const remove = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定删除《${row.title}》吗？其下评论会一并删除，且无法恢复。`,
      "确认删除",
      { confirmButtonText: "确定删除", cancelButtonText: "取消", type: "warning" },
    );
    await deleteAdminArticle(row.id);
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
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(load);
onBeforeUnmount(() => {
  editorRef.value?.destroy();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search {
  max-width: 300px;
}

.status-filter {
  width: 130px;
}

.table-card {
  padding: 6px 10px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-soft);
  box-shadow: var(--card-shadow);
}

.title {
  color: var(--text-strong);
  font-weight: 500;
  border-bottom: 1px dashed transparent;
}

.title:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.status {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 0.7rem;
}

.status.on {
  color: #2f7d5d;
  background: color-mix(in srgb, #2f7d5d 13%, transparent);
}

.status.off {
  color: var(--text-faint);
  background: var(--surface);
}

.btn-ghost,
.btn-primary {
  padding: 8px 18px;
  font-size: 0.8rem;
  border-radius: 999px;
  transition: transform 0.25s var(--ease), opacity 0.25s var(--ease);
}

.btn-ghost {
  color: var(--text);
  border: 1px solid var(--border-strong);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.btn-primary {
  color: var(--accent-ink);
  background: var(--accent);
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  opacity: 0.92;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-mini {
  padding: 5px 11px;
  margin-right: 5px;
  font-size: 0.72rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.25s var(--ease), border-color 0.25s var(--ease);
}

.btn-mini:hover {
  color: var(--accent);
  border-color: var(--accent);
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

.editor-wrap {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #fff;
}

.editor-toolbar {
  border-bottom: 1px solid var(--border);
}

.editor-body {
  height: 320px;
  overflow-y: hidden;
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

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: none;
  border-radius: var(--radius-sm);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--accent);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: var(--text);
}

:deep(.el-dialog) {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

:deep(.el-dialog__title) {
  color: var(--text-strong);
}
</style>
