export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MessageCircle, Phone, User } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/seo/metadata";

const BRAND_GREEN = "#87CD1C";

const contactLinks = {
  email: "mailto:qisen0906@gmail.com",
  whatsapp: "https://wa.me/8613544558226",
} as const;

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return createPageMetadata({ locale, page: "contact", path: "/contact" });
}

type ContactRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

function ContactRow({ icon, label, children }: ContactRowProps) {
  return (
    <li className="flex gap-5 sm:gap-6">
      <div
        className="flex size-11 shrink-0 items-center justify-center sm:size-12"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </p>
        <div className="mt-2 text-base text-black sm:text-lg">{children}</div>
      </div>
    </li>
  );
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const iconClass = "size-6 sm:size-7";
  const iconStyle = { color: BRAND_GREEN };

  return (
    <section className="flex min-h-[calc(100svh-5rem)] flex-col bg-white">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <header className="text-center">
          <h1
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: BRAND_GREEN }}
          >
            {t("title")}
          </h1>
          <p className="mt-4 text-lg font-semibold text-black sm:text-xl">
            {t("subtitle")}
          </p>
        </header>

        <ul className="mt-14 space-y-10 sm:mt-16 sm:space-y-12">
          <ContactRow
            icon={<User className={iconClass} style={iconStyle} />}
            label={t("nameLabel")}
          >
            <p className="font-medium leading-snug">{t("name")}</p>
            <p className="mt-1 text-sm font-normal text-zinc-700 sm:text-base">
              {t("role")}
            </p>
          </ContactRow>

          <ContactRow
            icon={<Mail className={iconClass} style={iconStyle} />}
            label={t("emailLabel")}
          >
            <a
              href={contactLinks.email}
              className="font-medium text-black underline-offset-4 transition-opacity hover:opacity-70"
            >
              qisen0906@gmail.com
            </a>
          </ContactRow>

          <ContactRow
            icon={<Phone className={iconClass} style={iconStyle} />}
            label={t("whatsappLabel")}
          >
            <a
              href={contactLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-black underline-offset-4 transition-opacity hover:opacity-70"
            >
              +86 13544558226
            </a>
          </ContactRow>

          <ContactRow
            icon={<MessageCircle className={iconClass} style={iconStyle} />}
            label={t("wechatLabel")}
          >
            <p className="font-medium">13544558226</p>
          </ContactRow>
        </ul>

        <p className="mt-16 border-t border-zinc-200 pt-10 text-center text-sm leading-relaxed text-zinc-600 sm:text-base">
          {t("footerNote")}
        </p>
      </div>
    </section>
  );
}
