import { notFound } from "next/navigation";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPostById } from "@/lib/supabase/queries";
import { ArrowLeft, Eye, Calendar } from "lucide-react";

const boardNames: Record<string, string> = {
  notice: "공지사항",
  review: "교육후기",
  photo_gallery: "교육사진 갤러리",
  video_gallery: "영상갤러리",
  resource: "자료실",
};

export default async function PostDetailPage({ params }: { params: Promise<{ board: string; id: string }> }) {
  const { board, id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const boardLabel = boardNames[board] || board;
  const boardHref = board === "photo_gallery" ? "/community/gallery" : board === "video_gallery" ? "/community/videos" : `/community/${board}`;

  return (
    <>
      <SubpageHero
        title={boardLabel}
        breadcrumb={[{ label: "커뮤니티" }, { label: boardLabel, href: boardHref }, { label: post.title }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          {/* 글 헤더 */}
          <div className="mb-8 pb-6 border-b border-border">
            <h1 className="text-xl lg:text-2xl font-bold text-text mb-3">{post.title}</h1>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Calendar size={12} />{post.created_at}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{post.view_count}</span>
            </div>
          </div>

          {/* 영상 */}
          {post.video_url && (
            <div className="aspect-video mb-8 rounded-xl overflow-hidden bg-gray-900">
              <iframe
                src={post.video_url}
                className="w-full h-full"
                allowFullScreen
                title={post.title}
              />
            </div>
          )}

          {/* 본문 */}
          {post.content && (
            <div className="prose max-w-none text-text-sub leading-relaxed whitespace-pre-line mb-10">
              {post.content}
            </div>
          )}

          {/* 목록으로 */}
          <div className="pt-6 border-t border-border">
            <Link href={boardHref} className="inline-flex items-center gap-2 text-sm text-text-sub hover:text-primary transition-colors">
              <ArrowLeft size={16} />
              목록으로
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
