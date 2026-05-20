# RIBO Website

公司官网项目，用于展示全自动高速直线 PET 吹瓶机。基于 Next.js App Router，支持中英文（`/cn`、`/en`）与 SEO 友好目录结构。

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **next-intl** — i18n，`/cn` 与 `/en` 路由前缀
- **shadcn/ui** — UI 组件库
- 品牌色：主色 `#333333`，强调色 `#8CC63F`

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

访问：

- 中文（默认）：[http://localhost:3000/cn](http://localhost:3000/cn)
- English：[http://localhost:3000/en](http://localhost:3000/en)

根路径 `/` 会自动重定向到默认语言 `/cn`。

## Project Structure (SEO-oriented)

```
src/
├── app/
│   ├── [locale]/          # 按语言分组的页面（利于 hreflang）
│   │   ├── layout.tsx
│   │   ├── page.tsx       # 首页
│   │   └── products/
│   ├── sitemap.ts         # 多语言 sitemap
│   └── robots.ts
├── components/
│   ├── layout/            # Header、Footer、语言切换
│   ├── seo/               # JSON-LD 等结构化数据
│   └── ui/                # shadcn 组件
├── i18n/                  # 路由与导航
├── messages/              # cn.json / en.json 文案
├── lib/seo/               # metadata 工具函数
└── config/site.ts         # 站点全局配置
```

## Scripts

| Command        | Description      |
| -------------- | ---------------- |
| `npm run dev`  | 开发服务器       |
| `npm run build`| 生产构建         |
| `npm run start`| 启动生产服务     |
| `npm run lint` | ESLint 检查      |

## Environment

| Variable                 | Description        |
| ------------------------ | ------------------ |
| `NEXT_PUBLIC_SITE_URL`   | 站点正式域名（SEO） |
