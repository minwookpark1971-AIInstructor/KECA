"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin, Eye, Search } from "lucide-react";

interface Post {
  id: string;
  title: string;
  is_pinned?: boolean;
  view_count: number;
  created_at: string;
}

export default function NoticeContent({ posts }: { posts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = searchQuery.trim()
    ? posts.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  return (
    <>
      <div className="mb-6 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="공지사항 검색..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      <div className="border border-border-light rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface text-text-sub border-b border-border-light">
              <th className="px-4 py-3 text-left font-medium w-16">번호</th>
              <th className="px-4 py-3 text-left font-medium">제목</th>
              <th className="px-4 py-3 text-center font-medium w-24 hidden sm:table-cell">조회</th>
              <th className="px-4 py-3 text-center font-medium w-28 hidden sm:table-cell">날짜</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, i) => (
                <tr key={post.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-text-muted">
                    {post.is_pinned ? <Pin size={14} className="text-accent" /> : filteredPosts.length - i}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/community/notice/${post.id}`} className="text-text hover:text-primary transition-colors font-medium">
                      {post.is_pinned && <span className="text-xs text-accent font-semibold mr-1.5">[공지]</span>}
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">
                    <span className="flex items-center justify-center gap-1"><Eye size={12} />{post.view_count}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">{post.created_at}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-sm text-text-muted">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
