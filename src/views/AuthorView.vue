<template>
  <div class="author">
    <!-- 顶栏 -->
    <header class="author-header">
      <div class="header-left">
        <RouterLink to="/" class="brand">
          <span class="dot"></span>
          <span>晓升汐落</span>
        </RouterLink>
        <span class="sep"></span>
        <span class="crumb">作者中心</span>
      </div>
      <div class="header-right">
        <span class="who">{{ auth.displayName }} · {{ auth.roleLabel }}</span>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="btn-text">管理后台</RouterLink>
        <RouterLink to="/" class="btn-text">返回首页</RouterLink>
        <button class="btn-ghost" type="button" @click="handleLogout">退出</button>
      </div>
    </header>

    <div class="author-body">
      <!-- 发布文章 -->
      <el-card class="panel" shadow="never">
        <template #header>
          <span class="panel-title">发布新文章</span>
        </template>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入文章标题" />
          </el-form-item>

          <el-form-item label="分类">
            <el-input v-model="form.category" placeholder="请输入分类，如：技术分享" />
          </el-form-item>

          <el-form-item label="摘要">
            <el-input
              v-model="form.summary"
              type="textarea"
              :rows="2"
              placeholder="请输入文章摘要（选填）"
            />
          </el-form-item>

          <el-form-item label="内容" prop="content">
            <div class="editor-wrap">
              <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                mode="simple"
                class="editor-toolbar"
              />
              <Editor
                v-model="form.content"
                :defaultConfig="editorConfig"
                mode="simple"
                class="editor-body"
                @onCreated="handleEditorCreated"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting"
              @click="handlePublish"
            >
              {{ submitting ? "发布中…" : "发布文章" }}
            </button>
            <button class="btn-ghost" type="button" @click="resetForm">重置</button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 我的文章 -->
      <el-card class="panel" shadow="never">
        <template #header>
          <div class="panel-head">
            <span class="panel-title">我的文章</span>
            <span class="panel-hint">共 {{ articles.length }} 篇</span>
          </div>
        </template>

        <el-table :data="articles" class="table" v-loading="tableLoading">
          <el-table-column prop="id" label="ID" width="64" />
          <el-table-column prop="title" label="标题" min-width="200">
            <template #default="{ row }">
              <a
                class="title-link"
                :href="`/article/${row.id}`"
                target="_blank"
                rel="noopener"
              >{{ row.title }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" width="110">
            <template #default="{ row }">{{ row.category || "—" }}</template>
          </el-table-column>
          <el-table-column prop="viewCount" label="浏览" width="80" />
          <el-table-column prop="likeCount" label="点赞" width="80" />
          <el-table-column label="发布时间" width="170">
            <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <button class="btn-mini" type="button" @click="openEditDialog(row)">编辑</button>
              <button class="btn-mini danger" type="button" @click="handleDelete(row.id)">
                删除
              </button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 编辑对话框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑文章"
        width="800px"
        destroy-on-close
      >
        <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="editForm.title" placeholder="请输入文章标题" />
          </el-form-item>

          <el-form-item label="分类">
            <el-input v-model="editForm.category" placeholder="请输入分类" />
          </el-form-item>

          <el-form-item label="摘要">
            <el-input
              v-model="editForm.summary"
              type="textarea"
              :rows="2"
              placeholder="请输入文章摘要"
            />
          </el-form-item>

          <el-form-item label="内容" prop="content">
            <div class="editor-wrap">
              <Toolbar
                :editor="editEditorRef"
                :defaultConfig="toolbarConfig"
                mode="simple"
                class="editor-toolbar"
              />
              <Editor
                v-model="editForm.content"
                :defaultConfig="editorConfig"
                mode="simple"
                class="editor-body editor-body-sm"
                @onCreated="handleEditEditorCreated"
              />
            </div>
          </el-form-item>
        </el-form>

        <template #footer>
          <button class="btn-ghost" type="button" @click="editDialogVisible = false">
            取消
          </button>
          <button
            class="btn-primary"
            type="button"
            :disabled="editSubmitting"
            @click="handleUpdate"
          >
            {{ editSubmitting ? "保存中…" : "保存修改" }}
          </button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css";
import {
  publishArticle,
  getMyArticles,
  updateArticle,
  deleteArticle,
} from "../api/article";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const auth = useAuthStore();

const formRef = ref(null);
const editFormRef = ref(null);
const submitting = ref(false);
const editSubmitting = ref(false);
const tableLoading = ref(false);
const articles = ref([]);
const editDialogVisible = ref(false);
const currentArticleId = ref(null);

const form = reactive({ title: "", category: "", summary: "", content: "" });
const editForm = reactive({ title: "", category: "", summary: "", content: "" });

const rules = {
  title: [{ required: true, message: "请输入文章标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入文章内容", trigger: "blur" }],
};

const toolbarConfig = {};
const editorConfig = { placeholder: "请输入文章内容..." };
const editorRef = ref(null);
const editEditorRef = ref(null);

const handleEditorCreated = (editor) => {
  editorRef.value = editor;
};

const handleEditEditorCreated = (editor) => {
  editEditorRef.value = editor;
};

const handlePublish = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      await publishArticle(form);
      ElMessage.success("文章发布成功！");
      resetForm();
      fetchArticles();
    } catch (error) {
      ElMessage.error(error.message || "发布失败");
    } finally {
      submitting.value = false;
    }
  });
};

const resetForm = () => {
  form.title = "";
  form.category = "";
  form.summary = "";
  form.content = "";
  editorRef.value?.clear();
};

const fetchArticles = async () => {
  tableLoading.value = true;
  try {
    articles.value = await getMyArticles();
  } catch (error) {
    console.error("获取我的文章失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

const openEditDialog = (row) => {
  currentArticleId.value = row.id;
  editForm.title = row.title;
  editForm.category = row.category || "";
  editForm.summary = row.summary || "";
  editForm.content = row.content;
  editDialogVisible.value = true;
};

const handleUpdate = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return;
    editSubmitting.value = true;
    try {
      await updateArticle(currentArticleId.value, editForm);
      ElMessage.success("文章更新成功！");
      editDialogVisible.value = false;
      fetchArticles();
    } catch (error) {
      ElMessage.error(error.message || "更新失败");
    } finally {
      editSubmitting.value = false;
    }
  });
};

const handleDelete = (id) => {
  ElMessageBox.confirm("确定要删除这篇文章吗？删除后无法恢复。", "确认删除", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await deleteArticle(id);
        ElMessage.success("删除成功");
        fetchArticles();
      } catch (error) {
        ElMessage.error(error.message || "删除失败");
      }
    })
    .catch(() => {});
};

const handleLogout = () => {
  auth.clear();
  ElMessage.success("已退出");
  router.push("/login");
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

onMounted(fetchArticles);
onBeforeUnmount(() => {
  editorRef.value?.destroy();
  editEditorRef.value?.destroy();
});
</script>

<style scoped>
.author {
  min-height: 100vh;
}

/* ====== 顶栏 ====== */
.author-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 64px;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-strong);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}

.sep {
  width: 1px;
  height: 15px;
  background: var(--border-strong);
}

.crumb {
  font-size: 0.84rem;
  color: var(--text-dim);
}

.who {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.btn-text {
  font-size: 0.8rem;
  color: var(--text-dim);
  padding: 7px 12px;
  border-radius: 999px;
  transition: color 0.3s var(--ease), background 0.3s var(--ease);
}

.btn-text:hover {
  color: var(--accent);
  background: var(--surface);
}

.btn-ghost {
  padding: 8px 18px;
  font-size: 0.8rem;
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  transition: border-color 0.3s var(--ease), color 0.3s var(--ease);
}

.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* ====== 主体 ====== */
.author-body {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 30px 24px 80px;
}

.panel {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-soft);
  box-shadow: var(--card-shadow);
  margin-bottom: 22px;
}

:deep(.panel .el-card__header) {
  border-bottom: 1px solid var(--border);
  padding: 17px 22px;
}

:deep(.panel .el-card__body) {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.panel-title {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-strong);
  letter-spacing: 0.02em;
}

.panel-hint {
  font-size: 0.74rem;
  color: var(--text-faint);
}

:deep(.el-form-item__label) {
  color: var(--text-dim);
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: none;
  border-radius: var(--radius-sm);
  transition: border-color 0.3s var(--ease);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: var(--text);
}

:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: var(--text-faint);
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
  height: 400px;
  overflow-y: hidden;
}

.editor-body-sm {
  height: 300px;
}

.btn-primary {
  padding: 9px 24px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--accent-ink);
  background: var(--accent);
  margin-right: 10px;
  transition: transform 0.3s var(--ease), opacity 0.3s var(--ease);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.92;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  padding: 10px 0;
}

.title-link {
  color: var(--text-strong);
  font-weight: 500;
  border-bottom: 1px dashed transparent;
}

.title-link:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-mini {
  padding: 5px 12px;
  margin-right: 6px;
  font-size: 0.74rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.3s var(--ease), border-color 0.3s var(--ease);
}

.btn-mini:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-mini.danger:hover {
  color: #c4453d;
  border-color: #c4453d;
}

:deep(.el-dialog) {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

:deep(.el-dialog__title) {
  color: var(--text-strong);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid var(--border);
  padding-top: 18px;
}

@media (max-width: 720px) {
  .author-header {
    padding: 0 16px;
  }
  .who {
    display: none;
  }
  .author-body {
    padding: 20px 14px 60px;
  }
}
</style>
