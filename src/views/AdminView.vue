<template>
  <div class="admin">
    <!-- 顶栏 -->
    <header class="admin-header">
      <div class="header-left">
        <h2>📝 文章管理</h2>
      </div>
      <div class="header-right">
        <span>你好，{{ nickname }}</span>
        <el-button type="danger" size="small" @click="handleLogout"
          >退出</el-button
        >
      </div>
    </header>

    <!-- 主体 -->
    <div class="admin-body">
      <!-- 发布文章卡片 -->
      <el-card class="publish-card">
        <template #header>
          <span>发布新文章</span>
        </template>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入文章标题" />
          </el-form-item>

          <el-form-item label="分类" prop="category">
            <el-input
              v-model="form.category"
              placeholder="请输入分类，如：技术分享"
            />
          </el-form-item>

          <el-form-item label="摘要" prop="summary">
            <el-input
              v-model="form.summary"
              type="textarea"
              :rows="2"
              placeholder="请输入文章摘要（选填）"
            />
          </el-form-item>

          <el-form-item label="内容" prop="content">
            <div style="border: 1px solid #dcdfe6; border-radius: 4px">
              <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                mode="simple"
                style="border-bottom: 1px solid #dcdfe6"
              />
              <Editor
                v-model="form.content"
                :defaultConfig="editorConfig"
                mode="simple"
                style="height: 400px; overflow-y: hidden"
                @onCreated="handleEditorCreated"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="submitting"
              @click="handlePublish"
            >
              发布文章
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- ====== 编辑对话框 ====== -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑文章"
        width="800px"
        destroy-on-close
      >
        <el-form
          :model="editForm"
          :rules="rules"
          ref="editFormRef"
          label-width="80px"
        >
          <el-form-item label="标题" prop="title">
            <el-input v-model="editForm.title" placeholder="请输入文章标题" />
          </el-form-item>

          <el-form-item label="分类" prop="category">
            <el-input v-model="editForm.category" placeholder="请输入分类" />
          </el-form-item>

          <el-form-item label="摘要" prop="summary">
            <el-input
              v-model="editForm.summary"
              type="textarea"
              :rows="2"
              placeholder="请输入文章摘要"
            />
          </el-form-item>

          <el-form-item label="内容" prop="content">
            <div style="border: 1px solid #dcdfe6; border-radius: 4px">
              <Toolbar
                :editor="editEditorRef"
                :defaultConfig="toolbarConfig"
                mode="simple"
                style="border-bottom: 1px solid #dcdfe6"
              />
              <Editor
                v-model="editForm.content"
                :defaultConfig="editorConfig"
                mode="simple"
                style="height: 300px; overflow-y: hidden"
                @onCreated="handleEditEditorCreated"
              />
            </div>
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="editSubmitting"
            @click="handleUpdate"
          >
            保存修改
          </el-button>
        </template>
      </el-dialog>

      <!-- 已发布文章列表 -->
      <el-card class="article-list-card" style="margin-top: 24px">
        <template #header>
          <span>已发布文章</span>
        </template>

        <el-table :data="articles" style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="标题" min-width="150" />
          <el-table-column prop="category" label="分类" width="100" />
          <el-table-column prop="viewCount" label="浏览量" width="80" />
          <el-table-column prop="likeCount" label="点赞" width="80" />
          <el-table-column prop="createTime" label="发布时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="openEditDialog(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import "@wangeditor/editor/dist/css/style.css";
import {
  publishArticle,
  getArticleList,
  updateArticle,
  deleteArticle,
} from "../api/article";

const router = useRouter();
const formRef = ref(null);
const editFormRef = ref(null);
const submitting = ref(false);
const editSubmitting = ref(false);
const tableLoading = ref(false);
const articles = ref([]);
const editDialogVisible = ref(false);
const currentArticleId = ref(null);

// 用户信息
const username = localStorage.getItem("username") || "";
const nickname = localStorage.getItem("nickname") || username;

// 发布表单
const form = reactive({
  title: "",
  category: "",
  summary: "",
  content: "",
});

// 编辑表单
const editForm = reactive({
  title: "",
  category: "",
  summary: "",
  content: "",
});

// 表单验证规则
const rules = {
  title: [{ required: true, message: "请输入文章标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入文章内容", trigger: "blur" }],
};

// 富文本编辑器配置
const toolbarConfig = {};
const editorConfig = {
  placeholder: "请输入文章内容...",
};
const editorRef = ref(null);
const editEditorRef = ref(null);

const handleEditorCreated = (editor) => {
  editorRef.value = editor;
};

const handleEditEditorCreated = (editor) => {
  editEditorRef.value = editor;
};

// ====== 发布文章 ======
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

// 重置发布表单
const resetForm = () => {
  form.title = "";
  form.category = "";
  form.summary = "";
  form.content = "";
  if (editorRef.value) {
    editorRef.value.clear();
  }
};

// ====== 获取文章列表 ======
const fetchArticles = async () => {
  tableLoading.value = true;
  try {
    articles.value = await getArticleList();
  } catch (error) {
    console.error("获取文章列表失败:", error);
  } finally {
    tableLoading.value = false;
  }
};

// ====== 编辑文章 ======
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

// ====== 删除文章 ======
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
    .catch(() => {
      // 用户取消删除
    });
};

// ====== 退出登录 ======
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("nickname");
  ElMessage.success("已退出");
  router.push("/login");
};

// ====== 格式化时间 ======
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-header {
  background: white;
  padding: 16px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left h2 {
  margin: 0;
  color: #2c3e50;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-body {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.publish-card {
  border-radius: 12px;
}

:deep(.w-e-toolbar) {
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

:deep(.w-e-text-container) {
  border: none !important;
}
</style>
