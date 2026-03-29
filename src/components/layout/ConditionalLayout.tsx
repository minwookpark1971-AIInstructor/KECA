"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { QuickMenu } from "./QuickMenu";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <main id="main-content" className="min-h-screen">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <QuickMenu />}
    </>
  );
}
