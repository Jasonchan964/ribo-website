import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/localize";
import type { CaseStudy, Product, TechSpec } from "@/lib/types";

export type {
  CaseStudy,
  LocalizedString,
  Product,
  ProductReview,
  TechSpec,
} from "@/lib/types";
export { localize };

// ---------------------------------------------------------------------------
// Mock CMS payload — 未来可替换为 Headless CMS / REST / GraphQL 响应
// ---------------------------------------------------------------------------

const products: Product[] = [
  {
    id: "prod-rb-6000",
    slug: "rb-6000",
    featured: true,
    name: {
      cn: "RB-6000 高速直线吹瓶机",
      en: "RB-6000 High-Speed Linear Blow Molder",
    },
    shortDescription: {
      cn: "面向饮料与中大型瓶型的全自动直线吹瓶解决方案，兼顾产能与稳定性。",
      en: "Fully automatic linear blow molding for beverages and mid-to-large bottle formats with balanced throughput and stability.",
    },
    description: {
      cn: "RB-6000 采用直线式布局与多腔同步拉伸吹塑工艺，适配 0.3L–2L PET 瓶型。整机集成智能温控、伺服拉伸与在线检测，支持快速换模，适合 24/7 连续生产场景。",
      en: "The RB-6000 uses a linear layout with multi-cavity stretch-blow synchronization for 0.3L–2L PET bottles. Intelligent thermal control, servo stretch, and inline inspection support rapid mold changeovers for 24/7 production.",
    },
    mainImage:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
      "https://images.unsplash.com/photo-1565043589225-1a6fd0990752?w=1200&q=80",
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    specifications: [
      spec("产能", "Output", "6,000", "6,000", "瓶/小时", "bottles/hr"),
      spec("腔数", "Cavities", "6", "6"),
      spec("瓶口范围", "Neck Finish", "28–38", "28–38", "mm", "mm"),
      spec("瓶容量", "Bottle Volume", "0.3–2.0", "0.3–2.0", "L", "L"),
      spec("额定功率", "Installed Power", "180", "180", "kW", "kW"),
      spec("占地面积", "Footprint", "12 × 4.5", "12 × 4.5", "m", "m"),
    ],
    metaKeywords: {
      cn: "6000瓶每小时,PET直线吹瓶机,饮料瓶生产设备",
      en: "6000 BPH,PET linear blow molder,beverage bottle production",
    },
    reviews: [
      {
        author: { cn: "华东饮料集团", en: "East China Beverage Group" },
        reviewBody: {
          cn: "产线稳定性出色，维护响应及时，吹瓶良品率持续达标。",
          en: "Excellent line stability and responsive support; bottle quality consistently meets our targets.",
        },
        ratingValue: 5,
        datePublished: "2025-08-20",
      },
      {
        author: { cn: "瓶装水生产企业", en: "Bottled Water Manufacturer" },
        reviewBody: {
          cn: "换模效率高，能耗较上一代设备明显降低。",
          en: "Fast mold changeovers and noticeably lower energy use versus our previous equipment.",
        },
        ratingValue: 4.5,
        datePublished: "2025-11-02",
      },
    ],
    publishedAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "prod-rb-4000",
    slug: "rb-4000",
    name: {
      cn: "RB-4000 标准直线吹瓶机",
      en: "RB-4000 Standard Linear Blow Molder",
    },
    shortDescription: {
      cn: "高性价比直线机型，适合新建产线与中等产能扩产项目。",
      en: "Cost-effective linear platform for new lines and mid-scale capacity expansion.",
    },
    description: {
      cn: "RB-4000 覆盖常见 PET 瓶型，结构模块化，维护便捷。支持远程诊断与生产数据追溯，帮助客户缩短投产周期。",
      en: "The RB-4000 covers common PET formats with a modular design for easy maintenance, remote diagnostics, and production traceability to shorten commissioning time.",
    },
    mainImage:
      "https://images.unsplash.com/photo-1565043589225-1a6fd0990752?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565043589225-1a6fd0990752?w=1200&q=80",
    ],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    specifications: [
      spec("产能", "Output", "4,000", "4,000", "瓶/小时", "bottles/hr"),
      spec("腔数", "Cavities", "4", "4"),
      spec("瓶容量", "Bottle Volume", "0.25–1.5", "0.25–1.5", "L", "L"),
      spec("额定功率", "Installed Power", "120", "120", "kW", "kW"),
    ],
    metaKeywords: {
      cn: "4000瓶每小时,经济型吹瓶机,食品级PET瓶",
      en: "4000 BPH,economical blow molder,food-grade PET bottle",
    },
    reviews: [
      {
        author: { cn: "食用油包装企业", en: "Edible Oil Packaging Co." },
        reviewBody: {
          cn: "改造后产能提升明显，操作培训到位，投产顺利。",
          en: "Clear capacity gains after retrofit; training was thorough and commissioning went smoothly.",
        },
        ratingValue: 4.5,
        datePublished: "2025-10-15",
      },
    ],
    publishedAt: "2025-03-10T00:00:00.000Z",
    updatedAt: "2025-11-20T00:00:00.000Z",
  },
  {
    id: "prod-rb-9000",
    slug: "rb-9000",
    featured: true,
    name: {
      cn: "RB-9000 超高速直线吹瓶机",
      en: "RB-9000 Ultra High-Speed Linear Blow Molder",
    },
    shortDescription: {
      cn: "旗舰级超高速平台，面向大型饮料集团超高节拍产线。",
      en: "Flagship ultra high-speed platform for large beverage groups running maximum line rates.",
    },
    description: {
      cn: "RB-9000 在直线架构上优化加热与拉伸时序，提升节拍上限并降低单位能耗。配备高级 HMI 与配方管理系统，支持多 SKU 快速切换。",
      en: "The RB-9000 optimizes heating and stretch timing on a linear architecture for higher cycle rates and lower energy per bottle, with advanced HMI and recipe management for rapid SKU changeovers.",
    },
    mainImage:
      "https://images.unsplash.com/photo-1504914563954-0a000f0c0f0b?w=1200&q=80",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    specifications: [
      spec("产能", "Output", "9,000", "9,000", "瓶/小时", "bottles/hr"),
      spec("腔数", "Cavities", "9", "9"),
      spec("瓶容量", "Bottle Volume", "0.3–2.0", "0.3–2.0", "L", "L"),
      spec("额定功率", "Installed Power", "260", "260", "kW", "kW"),
    ],
    metaKeywords: {
      cn: "9000瓶每小时,超高速吹瓶机,大型饮料产线",
      en: "9000 BPH,ultra high-speed blow molder,large beverage line",
    },
    reviews: [
      {
        author: { cn: "国际饮料品牌", en: "International Beverage Brand" },
        reviewBody: {
          cn: "超高节拍下仍保持瓶型稳定，是集团扩产的关键设备。",
          en: "Maintains bottle consistency at ultra-high cycle rates—a key asset for our expansion program.",
        },
        ratingValue: 5,
        datePublished: "2026-01-10",
      },
    ],
    publishedAt: "2025-09-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  },
];

const caseStudies: CaseStudy[] = [
  {
    id: "case-beverage-01",
    slug: "east-china-beverage-line",
    clientName: {
      cn: "华东某大型饮料集团",
      en: "Major Beverage Group in East China",
    },
    projectDescription: {
      cn: "为客户新建 2 条 RB-6000 直线吹瓶产线，实现矿泉水与茶饮瓶型共线生产，投产 3 个月内达成设计产能的 98%。",
      en: "Two RB-6000 linear lines were installed for shared production of water and tea PET bottles, reaching 98% of design capacity within three months of commissioning.",
    },
    images: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
    ],
    industry: { cn: "饮料", en: "Beverage" },
    location: { cn: "中国 · 江苏", en: "Jiangsu, China" },
    relatedProductIds: ["prod-rb-6000"],
    publishedAt: "2025-07-12T00:00:00.000Z",
  },
  {
    id: "case-food-02",
    slug: "southeast-asia-edible-oil",
    clientName: {
      cn: "东南亚食用油包装企业",
      en: "Edible Oil Packaging Company in Southeast Asia",
    },
    projectDescription: {
      cn: "采用 RB-4000 改造原有半自动产线，瓶型切换时间缩短 40%，并配套远程运维与操作培训。",
      en: "An RB-4000 retrofit replaced a semi-automatic line, cutting SKU changeover time by 40% with remote support and operator training.",
    },
    images: [
      "https://images.unsplash.com/photo-1565043589225-1a6fd0990752?w=1200&q=80",
    ],
    industry: { cn: "食品包装", en: "Food Packaging" },
    location: { cn: "东南亚", en: "Southeast Asia" },
    relatedProductIds: ["prod-rb-4000"],
    publishedAt: "2025-10-05T00:00:00.000Z",
  },
];

function spec(
  labelCn: string,
  labelEn: string,
  valueCn: string,
  valueEn: string,
  unitCn?: string,
  unitEn?: string,
): TechSpec {
  return {
    label: { cn: labelCn, en: labelEn },
    value: { cn: valueCn, en: valueEn },
    ...(unitCn && unitEn
      ? { unit: { cn: unitCn, en: unitEn } }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Data access layer — Payload CMS 优先，无内容时回退 Mock
// ---------------------------------------------------------------------------

import {
  getProductFromPayloadBySlug,
  resolveCmsContent,
} from "@/lib/cms-source";

/** 规范化路由中的 slug（解码、去空格、小写） */
export function normalizeProductSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).trim().toLowerCase();
  } catch {
    return slug.trim().toLowerCase();
  }
}

const mockSnapshot = () => ({
  products: [...products].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  ),
  caseStudies: [...caseStudies].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  ),
});

async function getContent() {
  return resolveCmsContent(mockSnapshot());
}

export async function getProducts(): Promise<Product[]> {
  const { products: cmsProducts } = await getContent();
  return cmsProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normalized = normalizeProductSlug(slug);
  if (!normalized) return null;

  const fromPayload = await getProductFromPayloadBySlug(normalized);
  if (fromPayload) return fromPayload;

  const all = await getProducts();
  return (
    all.find((p) => normalizeProductSlug(p.slug) === normalized) ?? null
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.featured);
}

export async function getProductSlugs(): Promise<string[]> {
  const all = await getProducts();
  return all.map((p) => p.slug);
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const { caseStudies: cmsCases } = await getContent();
  return cmsCases;
}

export async function getCaseStudyBySlug(
  slug: string,
): Promise<CaseStudy | null> {
  const all = await getCaseStudies();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getCaseStudiesForProduct(
  productId: string,
): Promise<CaseStudy[]> {
  const all = await getCaseStudies();
  return all.filter((c) => c.relatedProductIds?.includes(productId));
}

/** 供管理后台 / CMS Webhook 使用的原始 JSON 结构导出 */
export function getCmsSnapshot(): {
  products: Product[];
  caseStudies: CaseStudy[];
} {
  return {
    products: structuredClone(products),
    caseStudies: structuredClone(caseStudies),
  };
}

export function formatSpecValue(
  spec: TechSpec,
  locale: Locale,
): string {
  const value = localize(spec.value, locale);
  const unit = spec.unit ? localize(spec.unit, locale) : "";
  return unit ? `${value} ${unit}` : value;
}
