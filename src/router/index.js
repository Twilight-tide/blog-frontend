import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import { useAuthStore } from "../store/auth";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/article/:id",
    name: "articleDetail",
    component: () => import("../views/ArticleDetail.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
  },
  {
    // 作者中心：授权作者与管理员
    path: "/author",
    name: "author",
    component: () => import("../views/AuthorView.vue"),
    meta: { requiresAuth: true, requiresAuthor: true },
  },
  {
    // 后台管理：仅管理员
    path: "/admin",
    component: () => import("../views/admin/AdminLayout.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: "", redirect: "/admin/dashboard" },
      {
        path: "dashboard",
        name: "adminDashboard",
        component: () => import("../views/admin/DashboardView.vue"),
      },
      {
        path: "users",
        name: "adminUsers",
        component: () => import("../views/admin/UsersView.vue"),
      },
      {
        path: "articles",
        name: "adminArticles",
        component: () => import("../views/admin/ArticlesView.vue"),
      },
      {
        path: "comments",
        name: "adminComments",
        component: () => import("../views/admin/CommentsView.vue"),
      },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return auth.canPublish ? "/author" : "/";
  }
  if (to.meta.requiresAuthor && !auth.canPublish) {
    return "/";
  }
});

export default router;
