# Twilight Blog - 前端

> 个人技术博客前端项目，基于 Vue 3 + Vite 构建

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.9-409EFF)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 目录

- [技术栈](#技术栈)
- [功能列表](#功能列表)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [部署](#部署)
- [许可证](#许可证)

---

## 🛠 技术栈

| 技术         | 版本 | 说明                   |
| ------------ | ---- | ---------------------- |
| Vue          | 3.5  | 渐进式 JavaScript 框架 |
| Vite         | 8.1  | 极速构建工具           |
| Vue Router   | 4.5  | 官方路由管理器         |
| Pinia        | 3.0  | 状态管理               |
| Axios        | 1.8  | HTTP 请求库            |
| Element Plus | 2.9  | 企业级 UI 组件库       |
| WangEditor   | 5.1  | 富文本编辑器           |
| marked       | 15.0 | Markdown 渲染          |

---

## ✨ 功能列表

### 前台（读者可见）

- [x] 文章列表（首页）
- [x] 文章详情（Markdown 渲染）
- [x] 分类筛选
- [x] 分页加载（加载更多）
- [x] 评论查看

### 后台（博主管理）

- [x] 用户登录（JWT Token）
- [x] 发布文章（富文本编辑器）
- [x] 编辑文章
- [x] 删除文章
- [x] 评论管理
- [x] 退出登录

### 用户体验

- [x] 响应式设计（适配移动端）
- [x] 加载状态反馈
- [x] 统一错误提示（ElMessage）
- [x] 路由守卫（未登录跳转）

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 1. 克隆项目

```bash
git clone https://github.com/Twilight-tide/blog-frontend.git
cd blog-frontend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可预览。

### 4. 打包构建

```bash
npm run build
```

构建产物在 `dist/` 目录下。

---

## 📁 项目结构

```
src/
├── api/                 # API 接口
│   ├── article.js       # 文章接口
│   ├── comment.js       # 评论接口
│   └── user.js          # 用户接口
├── components/          # 公共组件
├── views/               # 页面
│   ├── HomeView.vue     # 首页（文章列表）
│   ├── ArticleDetail.vue # 文章详情 + 评论
│   ├── LoginView.vue    # 登录页
│   └── AdminView.vue    # 管理后台
├── router/              # 路由配置
│   └── index.js
├── utils/               # 工具函数
│   └── request.js       # Axios 封装（拦截器）
├── App.vue              # 根组件
└── main.js              # 入口文件
```

---

## 🎨 页面预览

### 首页

![首页](screenshots/home.png)

### 文章详情

![详情页](screenshots/detail.png)

### 管理后台

![后台](screenshots/admin.png)

> 注：截图待补充，运行后可自行截图添加

---

## 🔧 环境变量

| 变量名              | 说明          | 默认值                  |
| ------------------- | ------------- | ----------------------- |
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8080` |

### 使用方式

创建 `.env.development`：

```
VITE_API_BASE_URL=http://localhost:8080
```

创建 `.env.production`：

```
VITE_API_BASE_URL=https://your-domain.com
```

---

## 🚢 部署

### 打包

```bash
npm run build
```

### 预览打包结果

```bash
npm run preview
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/blog-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 🔗 相关链接

- 后端项目：[Twilight-tide/blog](https://github.com/Twilight-tide/blog)
- 在线 Demo：待部署
