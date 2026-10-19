<template>
  <div class="users">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        class="search"
        placeholder="搜索用户名、昵称或备注"
        clearable
        @keyup.enter="search"
        @clear="search"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <el-select v-model="roleFilter" class="role-filter" placeholder="全部角色" @change="search">
        <el-option label="全部角色" value="" />
        <el-option label="管理员" value="ADMIN" />
        <el-option label="作者" value="AUTHOR" />
        <el-option label="读者" value="USER" />
      </el-select>

      <button class="btn-ghost" type="button" @click="search">刷新</button>
    </div>

    <div class="table-card">
      <el-table :data="rows" v-loading="loading" class="table">
        <el-table-column prop="id" label="ID" width="64" />
        <el-table-column prop="username" label="用户名" min-width="130">
          <template #default="{ row }">
            <span class="uname">{{ row.username }}</span>
            <span v-if="row.id === auth.userId" class="self-tag">你</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="110">
          <template #default="{ row }">{{ row.nickname || "—" }}</template>
        </el-table-column>

        <el-table-column label="角色" width="140">
          <template #default="{ row }">
            <el-select
              :model-value="row.role"
              size="small"
              :disabled="row.id === auth.userId"
              @change="(value) => changeRole(row, value)"
            >
              <el-option label="管理员" value="ADMIN" />
              <el-option label="作者" value="AUTHOR" />
              <el-option label="读者" value="USER" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="92">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enabled"
              :disabled="row.id === auth.userId || row.role === 'ADMIN'"
              @change="(value) => changeStatus(row, value)"
            />
          </template>
        </el-table-column>

        <el-table-column label="备注" min-width="150">
          <template #default="{ row }">
            <button class="remark" type="button" @click="editRemark(row)">
              {{ row.remark || "点击添加" }}
            </button>
          </template>
        </el-table-column>

        <el-table-column label="最后登录" width="160">
          <template #default="{ row }">{{ formatDate(row.lastLoginTime) || "从未登录" }}</template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <button class="btn-mini" type="button" @click="resetPassword(row)">
              重置密码
            </button>
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
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  updateUserRemark,
  resetUserPassword,
} from "../../api/admin";
import { useAuthStore } from "../../store/auth";

const auth = useAuthStore();

const rows = ref([]);
const loading = ref(false);
const keyword = ref("");
const roleFilter = ref("");
const page = ref(1);
const size = ref(10);
const total = ref(0);

const load = async () => {
  loading.value = true;
  try {
    const data = await getUsers({
      page: page.value,
      size: size.value,
      keyword: keyword.value || undefined,
      role: roleFilter.value || undefined,
    });
    rows.value = data.list;
    total.value = data.total;
  } catch (error) {
    console.error("加载账号失败", error);
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

const changeRole = async (row, value) => {
  try {
    await updateUserRole(row.id, value);
    row.role = value;
    ElMessage.success(`已将 ${row.username} 设为${{ ADMIN: "管理员", AUTHOR: "作者", USER: "读者" }[value]}`);
  } catch (error) {
    ElMessage.error(error.message || "修改角色失败");
  }
};

const changeStatus = async (row, value) => {
  try {
    await updateUserStatus(row.id, value);
    row.enabled = value;
    ElMessage.success(value ? `已解封 ${row.username}` : `已封禁 ${row.username}`);
  } catch (error) {
    ElMessage.error(error.message || "修改状态失败");
  }
};

const editRemark = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt(
      `给「${row.username}」加个备注，方便以后认人`,
      "编辑备注",
      {
        inputValue: row.remark || "",
        inputPlaceholder: "例如：大学同学 / 测试号",
        confirmButtonText: "保存",
        cancelButtonText: "取消",
        inputValidator: (v) => (v || "").length <= 200 || "备注不能超过 200 个字",
      },
    );
    await updateUserRemark(row.id, value || "");
    row.remark = value || "";
    ElMessage.success("备注已保存");
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "保存备注失败");
    }
  }
};

const resetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定重置「${row.username}」的密码吗？旧密码会立即失效。`,
      "重置密码",
      { confirmButtonText: "确定重置", cancelButtonText: "取消", type: "warning" },
    );
    const data = await resetUserPassword(row.id);
    ElMessageBox.alert(
      `新密码：${data.password}\n\n请立刻复制发给对方，这个密码只显示这一次。`,
      "重置成功",
      { confirmButtonText: "我已记下" },
    );
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(error.message || "重置失败");
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
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search {
  max-width: 320px;
}

.role-filter {
  width: 140px;
}

.table-card {
  padding: 6px 10px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-soft);
  box-shadow: var(--card-shadow);
}

.uname {
  font-weight: 600;
  color: var(--text-strong);
}

.self-tag {
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.64rem;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.remark {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  color: var(--text-dim);
  border-bottom: 1px dashed var(--border-strong);
}

.remark:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-mini {
  padding: 5px 12px;
  font-size: 0.74rem;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.25s var(--ease), border-color 0.25s var(--ease);
}

.btn-mini:hover {
  color: var(--accent);
  border-color: var(--accent);
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

@media (max-width: 720px) {
  .toolbar {
    flex-wrap: wrap;
  }
  .search {
    max-width: none;
    flex: 1 1 100%;
  }
}
</style>
