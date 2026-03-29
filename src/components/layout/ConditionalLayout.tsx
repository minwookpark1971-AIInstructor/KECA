"use client";

import { usePathname } from "next/navigation";
<<<<<<< Updated upstream
import { Header } from "./Header";
import { Footer } from "./Footer";
import { QuickMenu } from "./QuickMenu";
=======
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QuickMenu } from "@/components/layout/QuickMenu";
>>>>>>> Stashed changes

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

<<<<<<< Updated upstream
  return (
    <>
      {!isAdmin && <Header />}
      <main id="main-content" className="min-h-screen">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <QuickMenu />}
=======
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <QuickMenu />
>>>>>>> Stashed changes
    </>
  );
}
