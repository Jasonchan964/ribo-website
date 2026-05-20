import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 | Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <header className="border-b px-6 py-4">
          <p className="text-sm font-semibold tracking-wide text-primary">RIBO</p>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-muted-foreground">Page not found</p>
          <Link href="/cn" className="text-[#8CC63F] underline">
            返回首页 / Back to home
          </Link>
        </main>
        <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
          © RIBO
        </footer>
      </body>
    </html>
  );
}
