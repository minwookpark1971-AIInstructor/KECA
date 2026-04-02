"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProgramImage } from "@/types";

export default function ImageSlider({ images }: { images: ProgramImage[] }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-surface">
      {/* 이미지 */}
      <div className="relative aspect-[16/9]">
        {images.map((img, i) => (
          <img
            key={img.id}
            src={img.image_url}
            alt={img.alt_text || `과정소개 ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
              i === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        ))}
      </div>

      {/* 좌우 화살표 (2장 이상일 때만) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text p-2 rounded-full shadow transition-colors"
            aria-label="이전 이미지"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text p-2 rounded-full shadow transition-colors"
            aria-label="다음 이미지"
          >
            <ChevronRight size={20} />
          </button>

          {/* 인디케이터 도트 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-primary" : "bg-white/60"
                }`}
                aria-label={`${i + 1}번 이미지`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
