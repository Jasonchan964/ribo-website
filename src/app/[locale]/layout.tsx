import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { MainContent } from "@/components/layout/main-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/json-ld";
import { createSiteMetadata } from "@/lib/seo/metadata";
import { routing, type Locale } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = createSiteMetadata();

function getHtmlLang(locale: Locale): string {
  return locale === "cn" ? "zh-CN" : "en";
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={getHtmlLang(locale as Locale)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <OrganizationJsonLd locale={locale as Locale} />
        <WebSiteJsonLd locale={locale as Locale} />
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <MainContent>{children}</MainContent>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
