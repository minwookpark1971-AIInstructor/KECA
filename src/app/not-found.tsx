"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-extrabold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-text mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-text-sub mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
          >
            <Home size={16} /> 홈으로
          </Link>
          <button
            onClick={() => typeof window !== "undefined" && window.history.back()}
            className="inline-flex items-center gap-2 border border-border-light px-5 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:bg-surface transition-colors"
          >
            <ArrowLeft size={16} /> 이전 페이지
          </button>
        </div>
      </div>
    </section>
  );
}
