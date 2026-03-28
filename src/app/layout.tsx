import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QuickMenu } from "@/components/layout/QuickMenu";
import { ToastProvider } from "@/components/layout/Toast";

export const metadata: Metadata = {
  title: {
    default: "KECA - 한국교육컨설팅협회",
    template: "%s | KECA 한국교육컨설팅협회",
  },
  description:
    "한국교육컨설팅협회(KECA)는 교육컨설팅 분야의 전문성을 높이고, AI 시대 교육 혁신을 선도하는 대한민국 대표 교육컨설팅 전문기관입니다.",
  keywords: [
    "교육컨설팅",
    "AI교육",
    "교육전문가",
    "KECA",
    "한국교육컨설팅협회",
    "에듀테크",
    "진로컨설팅",
    "강사양성",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "KECA 한국교육컨설팅협회",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <ToastProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
            본문으로 건너뛰기
          </a>
          <Header />
          <main id="main-content" className="min-h-screen">{children}</main>
          <Footer />
          <QuickMenu />
        </ToastProvider>
      </body>
    </html>
  );
}
