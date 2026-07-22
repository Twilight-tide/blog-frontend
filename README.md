# Twilight Blog - Frontend

个人技术博客前端项目，基于 Vue 3 + Vite 构建。

## 技术栈

- **Vue 3.5** (Composition API)
- **Vite 8** (构建工具)
- **Vue Router 4** (路由)
- **Pinia** (状态管理)
- **Axios** (HTTP 请求)
- **Element Plus** (UI 组件库)
- **WangEditor** (富文本编辑器)
- **marked** (Markdown 渲染)

## 功能特性

- [x] 文章列表（首页）
- [x] 文章详情（Markdown 渲染）
- [x] 分类筛选
- [x] 分页加载（加载更多）
- [x] 用户登录（JWT Token）
- [x] 管理后台
- [x] 发布文章（富文本编辑器）
- [x] 退出登录

## 快速启动

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

## 项目结构

```
src/
├── api/              # API 接口
│   ├── article.js    # 文章接口
│   └── user.js       # 用户接口
├── components/       # 公共组件
├── views/            # 页面
│   ├── HomeView.vue       # 首页（文章列表）
│   ├── ArticleDetail.vue  # 文章详情
│   ├── LoginView.vue      # 登录页
│   └── AdminView.vue      # 管理后台
├── router/           # 路由配置
├── utils/            # 工具
│   └── request.js    # Axios 封装
├── App.vue
└── main.js
```

## 环境变量

| 变量名              | 说明          | 默认值                  |
| ------------------- | ------------- | ----------------------- |
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8080` |

## 相关仓库

- 后端项目: [Twilight-tide/blog](https://github.com/Twilight-tide/blog)

## 许可证

MIT License
