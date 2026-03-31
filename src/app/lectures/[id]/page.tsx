import { notFound } from "next/navigation";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPostById } from "@/lib/supabase/queries";
import { ArrowLeft, Eye, Calendar, Download } from "lucide-react";

export default async function LectureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <>
      <SubpageHero
        title="강의공고"
        breadcrumb={[{ label: "강의공고", href: "/lectures" }, { label: post.title }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          {/* 글 헤더 */}
          <div className="mb-8 pb-6 border-b border-border">
            <h1 className="text-xl lg:text-2xl font-bold text-text mb-3">{post.title}</h1>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Calendar size={12} />{post.created_at?.slice(0, 10)}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{post.view_count}</span>
            </div>
          </div>

          {/* 이미지 */}
          {post.thumbnail_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img src={post.thumbnail_url} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          {/* 본문 */}
          {post.content && (
            <div className="prose max-w-none text-text-sub leading-relaxed whitespace-pre-line mb-10">
              {post.content}
            </div>
          )}

          {/* 첨부파일 */}
          {post.file_url && (
            <div className="mb-10 p-4 bg-surface rounded-lg flex items-center gap-3">
              <Download size={18} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">첨부파일</p>
                <p className="text-xs text-text-muted truncate">{post.file_url.split("/").pop()}</p>
              </div>
              <a
                href={post.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-light transition-colors"
              >
                다운로드
              </a>
            </div>
          )}

          {/* 목록으로 */}
          <div className="pt-6 border-t border-border">
            <Link href="/lectures" className="inline-flex items-center gap-2 text-sm text-text-sub hover:text-primary transition-colors">
              <ArrowLeft size={16} />
              목록으로
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
