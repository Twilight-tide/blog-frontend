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
