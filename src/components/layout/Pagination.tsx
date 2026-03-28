"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const getHref = (page: number) => {
    const separator = basePath.includes("?") ? "&" : "?";
    return page === 1 ? basePath : `${basePath}${separator}page=${page}`;
  };

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="페이지 이동">
      {currentPage > 1 && (
        <Link
          href={getHref(currentPage - 1)}
          className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors"
          aria-label="이전 페이지"
        >
          <ChevronLeft size={16} />
        </Link>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-text-muted text-sm">...</span>
        ) : (
          <Link
            key={p}
            href={getHref(p)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
              p === currentPage
                ? "bg-primary text-white"
                : "text-text-sub hover:bg-surface hover:text-primary"
            )}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={getHref(currentPage + 1)}
          className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors"
          aria-label="다음 페이지"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
