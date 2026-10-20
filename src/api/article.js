import request from "../utils/request";

// 获取文章列表
export const getArticleList = () => {
  return request.get("/api/article/list");
};

// 获取文章详情
export const getArticleDetail = (id) => {
  return request.get(`/api/article/${id}`);
};

// 发布文章（需要Token）
export const publishArticle = (data) => {
  return request.post("/api/article/publish", data);
};

// 更新文章（需要Token）
export const updateArticle = (id, data) => {
  return request.put(`/api/article/${id}`, data);
};

// 删除文章（需要Token）
export const deleteArticle = (id) => {
  return request.delete(`/api/article/${id}`);
};

// 我的文章（作者中心）
export const getMyArticles = () => {
  return request.get("/api/article/mine");
};

// 首页分页（page 从 1 开始，category 可选）
export const getArticlePage = (page, size, category) => {
  return request.get("/api/article/page", { params: { page, size, category } });
};

// 首页分类列表
export const getCategories = () => {
  return request.get("/api/article/categories");
};

// 保存草稿
export const saveDraft = (data) => {
  return request.post("/api/article/draft", data);
};

// 发布草稿
export const publishDraft = (id) => {
  return request.patch(`/api/article/${id}/publish`);
};
