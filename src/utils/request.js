import axios from "axios";
import { ElMessage } from "element-plus";

const request = axios.create({
  baseURL: "/", // 后端地址
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 200) {
      return res.data;
    } else {
      ElMessage.error(res.msg || "请求失败");
      return Promise.reject(new Error(res.msg || "请求失败"));
    }
  },
  (error) => {
    const res = error.response?.data;
    const serverMsg =
      res && typeof res === "object" && res.msg ? String(res.msg) : "";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // /api/user/me 是启动时的静默校验，过期时不打扰用户
      if (!String(error.config?.url || "").includes("/api/user/me")) {
        ElMessage.error("登录已过期，请重新登录");
      }
    } else if (error.response?.status === 403) {
      // 后端业务 403 会带 msg；CORS 拒绝等情况下没有 body，给一句中文兜底
      ElMessage.error(serverMsg || "没有权限执行该操作");
    } else if (serverMsg) {
      // 后端业务错误（400/404/500）都带 msg，优先展示它
      ElMessage.error(serverMsg);
    } else {
      ElMessage.error(error.message || "网络错误");
    }
    return Promise.reject(new Error(serverMsg || error.message || "网络错误"));
  },
);

export default request;
