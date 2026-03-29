"use client";

import { useState } from "react";
import { SlidersHorizontal, GripVertical, Eye, EyeOff, Megaphone, CalendarDays, Star, Image, Video, FolderArchive } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

interface BoardConfig {
  slug: string;
  name: string;
  boardType: string;
  icon: ReactElement;
  description: string;
  active: boolean;
}

const defaultBoards: BoardConfig[] = [
  { slug: "notice", name: "공지사항", boardType: "general", icon: <Megaphone size={16} />, description: "협회 공지사항 및 안내", active: true },
  { slug: "schedule", name: "교육일정", boardType: "schedule", icon: <CalendarDays size={16} />, description: "교육 프로그램 일정 안내", active: true },
  { slug: "review", name: "교육후기", boardType: "general", icon: <Star size={16} />, description: "교육 참가자 후기 게시판", active: true },
  { slug: "photo_gallery", name: "교육사진 갤러리", boardType: "photo", icon: <Image size={16} />, description: "교육 현장 사진 갤러리", active: true },
  { slug: "video_gallery", name: "영상갤러리", boardType: "video", icon: <Video size={16} />, description: "교육 영상 갤러리", active: true },
  { slug: "resource", name: "자료실", boardType: "file", icon: <FolderArchive size={16} />, description: "교육 자료 다운로드", active: true },
];

export default function CommunitySettingsClient() {
  const [boards] = useState<BoardConfig[]>(defaultBoards);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">커뮤니티 메뉴 관리</h1>
          <p className="text-sm text-text-muted mt-1">커뮤니티 하위 메뉴를 관리합니다.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800">
          현재 커뮤니티 메뉴는 기본 6개 메뉴로 구성되어 있습니다.
          각 메뉴의 게시물은 해당 관리 페이지에서 등록/수정/삭제할 수 있습니다.
        </p>
      </div>

      <div className="space-y-3">
        {boards.map((board) => (
          <div
            key={board.slug}
            className="bg-white border border-border-light rounded-xl p-4 flex items-center gap-4"
          >
            <GripVertical size={16} className="text-text-muted/40 shrink-0 cursor-grab" />

            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 text-primary">
              {board.icon}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text">{board.name}</h3>
              <p className="text-xs text-text-muted">{board.description}</p>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-text-muted shrink-0">
              {board.boardType}
            </span>

            <div className="flex items-center gap-1 shrink-0">
              <button
                className="p-1.5 text-text-muted hover:text-primary rounded"
                title={board.active ? "활성" : "비활성"}
              >
                {board.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <Link
                href={board.slug === "schedule" ? "/admin/community/schedule" : `/admin/community/${board.slug}`}
                className="px-3 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition-colors"
              >
                관리
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
