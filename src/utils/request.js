import axios from "axios";
import { ElMessage } from "element-plus";

const request = axios.create({
  baseURL: "http://localhost:8080", // 后端地址
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
    if (error.response?.status === 401) {
      ElMessage.error("登录已过期，请重新登录");
      localStorage.removeItem("token");
      // 可以跳转到登录页
    } else {
      ElMessage.error(error.message || "网络错误");
    }
    return Promise.reject(error);
  },
);

export default request;
