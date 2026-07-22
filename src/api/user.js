import request from "../utils/request";

// 登录
export const login = (data) => {
  return request.post("/api/user/login", data);
};

// 注册
export const register = (data) => {
  return request.post("/api/user/register", data);
};
