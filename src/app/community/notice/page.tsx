import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { mockNotices } from "@/lib/mock-community";
import { Pin, Eye } from "lucide-react";

export const metadata: Metadata = { title: "공지사항" };

export default function NoticePage() {
  return (
    <>
      <SubpageHero title="공지사항" breadcrumb={[{ label: "커뮤니티" }, { label: "공지사항" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
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
                {mockNotices.map((post, i) => (
                  <tr key={post.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-text-muted">
                      {post.is_pinned ? <Pin size={14} className="text-accent" /> : mockNotices.length - i}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
