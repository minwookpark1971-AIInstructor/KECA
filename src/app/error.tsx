"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-error" />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">오류가 발생했습니다</h1>
        <p className="text-sm text-text-sub mb-8">
          페이지를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
          >
            <RotateCcw size={16} /> 다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-border-light px-5 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:bg-surface transition-colors"
          >
            <Home size={16} /> 홈으로
          </Link>
        </div>
      </div>
    </section>
  );
}
