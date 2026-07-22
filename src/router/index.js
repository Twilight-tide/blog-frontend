import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import AdminView from "../views/AdminView.vue";

// 路由守卫：检查是否登录
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem("token");
  if (!token) {
    next("/login");
  } else {
    next();
  }
};

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
    path: "/admin",
    name: "admin",
    component: AdminView,
    beforeEnter: requireAuth, // 需要登录才能访问
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
