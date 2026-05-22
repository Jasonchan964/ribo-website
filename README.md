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
- **内容管理后台（Payload CMS）**：[http://localhost:3000/admin](http://localhost:3000/admin)

根路径 `/` 会自动重定向到默认语言 `/cn`。

### 首次启用 CMS

1. 在 `.env.local` 中配置 `PAYLOAD_SECRET`（随机长字符串）及 Cloudinary 变量（见下方 Environment）。
2. 创建首个管理员：`npm run seed:cms`（默认账号见 `.env.example` 中的 `CMS_ADMIN_*`）。
3. 打开 [http://localhost:3000/admin](http://localhost:3000/admin) 登录。
4. 在 **媒体库** 上传产品图/视频（自动同步到 Cloudinary），再在 **吹瓶机产品** 中创建或编辑条目。
5. CMS 中已有至少一条产品时，前台会自动读取 Payload 数据；否则继续使用内置 Mock 数据。

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
| `npm run seed:cms` | 创建首个 CMS 管理员 |
| `npm run generate:importmap` | 更新 Payload Admin import map |
| `npm run generate:types` | 生成 Payload TypeScript 类型 |

## Deploy on Vercel

1. 将仓库导入 [Vercel](https://vercel.com)，Framework Preset 选 **Next.js**（与根目录 `vercel.json` 一致）。
2. **Node.js 版本**：项目 `.nvmrc` 为 `20`，与 `package.json` 中 `engines.node` 一致。
3. 在 **Settings → Environment Variables** 填入下方变量（Production / Preview 建议都配置）。
4. **数据库**：正式环境请在 Neon 等创建 **Postgres**，设置 **`DATABASE_URL`** 为 `postgresql://…`。若暂未配置，部署仍可完成，前台会回退内置 Mock；**`/admin` 无持久库时请尽快接入 Postgres。**
5. 部署后确认：`/cn`、`/en`、`/sitemap.xml`、`/robots.txt` 可访问；上传功能需 Cloudinary 变量齐全；在 `/admin` 重新创建管理员或从本地导出/迁移数据（生产库与本地 `ribo-cms.db` 相互独立）。

构建命令：`npm run build`（默认，无需修改）。

## Environment

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SITE_URL` | Yes | 站点正式地址（SEO）；可填 `https://域名` 或仅域名（会自动补 `https://`） |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary 云名称（浏览器直传端点） |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Yes*† | **未签名上传预设**（推荐 Vercel：浏览器 → Cloudinary，绕过 4.5MB） |
| `CLOUDINARY_CLOUD_NAME` | Yes‡ | 同上，服务端删除/签名用 |
| `CLOUDINARY_API_KEY` | Yes‡ | Cloudinary API Key（签名模式或删除资源） |
| `CLOUDINARY_API_SECRET` | Yes‡ | Cloudinary API Secret（仅服务端） |
| `UPLOAD_AUTH_SECRET` | Recommended | 保护 `POST /api/cloudinary/sign`（自定义页面上传时） |
| `CLOUDINARY_UPLOAD_FOLDER` | No | 根目录，默认 `ribo/products` |
| `CLOUDINARY_IMAGE_FOLDER` | No | 产品图目录，默认 `ribo/products/images` |
| `CLOUDINARY_VIDEO_FOLDER` | No | 机器视频目录，默认 `ribo/products/videos` |
| `PAYLOAD_SECRET` | Yes (CMS) | Payload 会话与 API 签名密钥 |
| `DATABASE_URL` | **Yes on Vercel** | 生产：Neon **Pooled** 连接串（主机名含 `-pooler`，含 `sslmode=require`）。勿在代码里改写 URL。本地可省略，默认 SQLite |
| `DATABASE_POOL_MAX` | No | 覆盖 pg 池大小；Vercel 默认 `1`，本地默认 `10` |
| `PAYLOAD_DISABLE_PUSH` | No | 设为 `true` 则关闭自动建表（高级：改用 migrate） |
| `CMS_ADMIN_EMAIL` | No | `npm run seed:cms` 使用的管理员邮箱 |
| `CMS_ADMIN_PASSWORD` | No | `npm run seed:cms` 使用的初始密码 |

\* 媒体库 / `MediaUploader` 直传至少需要 `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`。  
† 配置 **未签名 Upload Preset** 后，上传使用 `upload_preset` + `folder` 直传，无需把文件 POST 到 Vercel。  
‡ 若未配置 `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`，则需 API Key/Secret 走签名上传；删除 Cloudinary 资源仍建议配置 Secret。

### CMS 与 Cloudinary

- 后台路由：**`/admin`**（Payload CMS，内置于本 Next.js 项目）
- 媒体上传：Admin **媒体库** 使用 **浏览器 → Cloudinary 直传**（`file` 二进制 + `folder` 参数，或 `upload_preset` 未签名模式），**不经过 Vercel 请求体**；超过约 20MB 自动分片。`filename` 保存为带扩展名的真实文件名，`cloudinaryPublicId` 保存 Cloudinary 路径，避免 `text/plain (from extension ribo/products/...)` 类 MIME 错误。
- **Vercel 上** 必须在环境变量中配置 **Postgres** 的 `DATABASE_URL`（见上表）；本地仍可用默认 SQLite `ribo-cms.db`。

### Cloudinary 上传组件（可选，供自定义页面）

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
