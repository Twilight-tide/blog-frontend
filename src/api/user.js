import request from "../utils/request";

// 登录
export const login = (data) => {
  return request.post("/api/user/login", data);
};

// 注册
export const register = (data) => {
  return request.post("/api/user/register", data);
};

// 当前登录用户（用于刷新角色）
export const getMe = () => {
  return request.get("/api/user/me");
};
