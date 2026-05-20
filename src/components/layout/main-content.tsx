"use client";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main className={cn("flex-1", !isHome && "pt-20")}>{children}</main>
  );
}
