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

## Deploy on Vercel

1. 将仓库导入 [Vercel](https://vercel.com)，Framework Preset 选 **Next.js**（与根目录 `vercel.json` 一致）。
2. **Node.js 版本**：项目 `.nvmrc` 为 `20`，与 `package.json` 中 `engines.node` 一致。
3. 在 **Settings → Environment Variables** 填入下方变量（Production / Preview 建议都配置）。
4. 部署后确认：`/cn`、`/en`、`/sitemap.xml`、`/robots.txt` 可访问；上传功能需 Cloudinary 变量齐全。

构建命令：`npm run build`（默认，无需修改）。

## Environment

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SITE_URL` | Yes | 站点正式域名（SEO canonical、sitemap） |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary 云名称（客户端上传端点） |
| `CLOUDINARY_CLOUD_NAME` | Yes* | 同上，服务端签名用 |
| `CLOUDINARY_API_KEY` | Yes* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Yes* | Cloudinary API Secret（仅服务端，勿暴露） |
| `UPLOAD_AUTH_SECRET` | Recommended | 保护 `POST /api/cloudinary/sign` |
| `CLOUDINARY_UPLOAD_FOLDER` | No | 根目录，默认 `ribo/products` |
| `CLOUDINARY_IMAGE_FOLDER` | No | 产品图目录，默认 `ribo/products/images` |
| `CLOUDINARY_VIDEO_FOLDER` | No | 机器视频目录，默认 `ribo/products/videos` |

\* 使用 `MediaUploader` 上传时需要。

### Cloudinary 上传组件

```tsx
import { MediaUploader } from "@/components/cloudinary";

// 产品高清图（authToken 与 UPLOAD_AUTH_SECRET 相同，仅在受信后台页面传入）
<MediaUploader
  resourceType="image"
  authToken={uploadSecretFromServer}
  onUploadComplete={(r) => console.log(r.secureUrl)}
/>

// 机器视频
<MediaUploader resourceType="video" authToken={uploadSecretFromServer} />
```

客户端通过 `POST /api/cloudinary/sign` 获取签名后，**直传 Cloudinary**（适合大视频，不经过 Vercel 函数体大小限制）。
