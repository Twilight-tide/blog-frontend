import request from "../utils/request";

// ====== 概览 ======
export const getStats = () => request.get("/api/admin/stats");

// ====== 账号管理 ======
export const getUsers = (params) => request.get("/api/admin/users", { params });
export const updateUserRole = (id, role) =>
  request.patch(`/api/admin/users/${id}/role`, { role });
export const updateUserStatus = (id, enabled) =>
  request.patch(`/api/admin/users/${id}/status`, { enabled });
export const updateUserRemark = (id, remark) =>
  request.patch(`/api/admin/users/${id}/remark`, { remark });
export const resetUserPassword = (id) =>
  request.post(`/api/admin/users/${id}/reset-password`);

// ====== 文章管理 ======
export const getAdminArticles = (params) =>
  request.get("/api/admin/articles", { params });
export const getAdminArticle = (id) =>
  request.get(`/api/admin/articles/${id}`);
export const updateArticlePublished = (id, published) =>
  request.patch(`/api/admin/articles/${id}/status`, { published });
export const deleteAdminArticle = (id) =>
  request.delete(`/api/admin/articles/${id}`);

// ====== 评论管理 ======
export const getAdminComments = (params) =>
  request.get("/api/admin/comments", { params });
export const deleteAdminComment = (id) =>
  request.delete(`/api/admin/comments/${id}`);
