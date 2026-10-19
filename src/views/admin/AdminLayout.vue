<template>
  <div class="shell">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <RouterLink to="/" class="brand">
        <span class="brand-dot"></span>
        <span class="brand-text">晓升汐落</span>
      </RouterLink>

      <p class="group-label">管理</p>
      <nav class="menu">
        <RouterLink
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          class="menu-item"
          active-class="active"
        >
          <el-icon class="menu-icon"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <p class="group-label">其他</p>
      <nav class="menu">
        <RouterLink to="/author" class="menu-item">
          <el-icon class="menu-icon"><EditPen /></el-icon>
          <span>作者中心</span>
        </RouterLink>
        <RouterLink to="/" class="menu-item">
          <el-icon class="menu-icon"><HomeFilled /></el-icon>
          <span>返回首页</span>
        </RouterLink>
      </nav>

      <div class="sidebar-foot">
        <div class="who">
          <span class="who-name">{{ auth.displayName }}</span>
          <span class="who-role">{{ auth.roleLabel }}</span>
        </div>
        <button class="logout" type="button" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <!-- 主体 -->
    <div class="main">
      <header class="topbar">
        <div>
          <h1 class="page-title">{{ currentTitle }}</h1>
          <p class="page-sub">{{ currentSub }}</p>
        </div>
        <span class="badge">{{ auth.roleLabel }}</span>
      </header>

      <section class="content">
        <RouterView />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const menu = [
  { to: "/admin/dashboard", label: "概览", icon: "DataLine" },
  { to: "/admin/users", label: "账号管理", icon: "User" },
  { to: "/admin/articles", label: "文章管理", icon: "Document" },
  { to: "/admin/comments", label: "评论管理", icon: "ChatDotRound" },
];

const TITLES = {
  adminDashboard: ["概览", "站点运行状态一览"],
  adminUsers: ["账号管理", "授权作者、封禁账号、重置密码"],
  adminArticles: ["文章管理", "全站文章上下架与删除"],
  adminComments: ["评论管理", "清理不合适的内容"],
};

const currentTitle = computed(() => TITLES[route.name]?.[0] || "管理后台");
const currentSub = computed(() => TITLES[route.name]?.[1] || "");

const handleLogout = () => {
  auth.clear();
  ElMessage.success("已退出");
  router.push("/login");
};
</script>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
}

/* ====== 侧边栏 ====== */
.sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  width: 232px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 26px 16px 20px;
  background: var(--bg-soft);
  border-right: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  margin-bottom: 30px;
}

.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}

.brand-text {
  font-family: var(--font-serif);
  font-size: 1.06rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-strong);
}

.group-label {
  padding: 0 10px;
  margin: 18px 0 8px;
  font-size: 0.66rem;
  letter-spacing: 0.22em;
  color: var(--text-faint);
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text-dim);
  cursor: pointer;
  transition: background 0.25s var(--ease), color 0.25s var(--ease);
}

.menu-item:hover {
  background: var(--surface);
  color: var(--text-strong);
}

.menu-item.active {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  font-weight: 600;
}

.menu-icon {
  font-size: 16px;
}

.sidebar-foot {
  margin-top: auto;
  padding: 14px 10px 0;
  border-top: 1px solid var(--border);
}

.who {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

.who-name {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-strong);
}

.who-role {
  font-size: 0.7rem;
  color: var(--text-faint);
}

.logout {
  width: 100%;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  font-size: 0.78rem;
  color: var(--text-dim);
  transition: border-color 0.25s var(--ease), color 0.25s var(--ease);
}

.logout:hover {
  border-color: #c4453d;
  color: #c4453d;
}

/* ====== 右侧 ====== */
.main {
  flex: 1;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 34px 40px 22px;
  border-bottom: 1px solid var(--border);
}

.page-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-strong);
  letter-spacing: 0.02em;
}

.page-sub {
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  white-space: nowrap;
}

.content {
  padding: 26px 40px 80px;
}

@media (max-width: 860px) {
  .shell {
    flex-direction: column;
  }
  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 14px 16px;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .brand {
    margin: 0 10px 0 0;
    padding: 0;
  }
  .group-label {
    display: none;
  }
  .menu {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .menu-item {
    padding: 8px 12px;
  }
  .sidebar-foot {
    margin: 0 0 0 auto;
    padding: 0;
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .who {
    display: none;
  }
  .topbar {
    padding: 22px 20px 16px;
  }
  .content {
    padding: 18px 16px 60px;
  }
}
</style>
