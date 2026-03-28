import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPostsByBoardPaginated, getPostCount } from "@/lib/supabase/queries";
import { Pagination } from "@/components/layout/Pagination";
import { Pin, Eye } from "lucide-react";
import SearchBar from "@/components/layout/SearchBar";

export const metadata: Metadata = { title: "공지사항" };

const PER_PAGE = 10;

export default async function NoticePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q || "";
  const [notices, totalCount] = await Promise.all([
    getPostsByBoardPaginated("notice", page, PER_PAGE, search || undefined),
    getPostCount("notice"),
  ]);
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <>
      <SubpageHero title="공지사항" breadcrumb={[{ label: "커뮤니티" }, { label: "공지사항" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <SearchBar basePath="/community/notice" placeholder="공지사항 검색" defaultValue={search} />

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
                {notices.map((post, i) => (
                  <tr key={post.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-text-muted">
                      {post.is_pinned ? <Pin size={14} className="text-accent" /> : totalCount - ((page - 1) * PER_PAGE + i)}
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
                    <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">{post.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
                {notices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-sm text-text-muted">
                      {search ? `"${search}" 검색 결과가 없습니다.` : "공지사항이 없습니다."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} basePath={search ? `/community/notice?q=${search}` : "/community/notice"} />
        </div>
      </section>
    </>
  );
}
