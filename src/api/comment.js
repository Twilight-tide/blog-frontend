import request from "../utils/request";

// 获取文章评论列表
export const getCommentList = (articleId) => {
  return request.get(`/api/comment/list/${articleId}`);
};

// 发表评论（需要Token）
export const publishComment = (data) => {
  return request.post("/api/comment/publish", data);
};

// 删除评论（需要Token）
export const deleteComment = (id) => {
  return request.delete(`/api/comment/${id}`);
};
