import { getPostsByBoard } from "@/lib/supabase/queries";
import { Plus, Edit2, Trash2, Eye, Pin } from "lucide-react";

const boardNames: Record<string, string> = {
  notice: "공지사항",
  review: "교육후기",
  photo_gallery: "교육사진 갤러리",
  video_gallery: "영상갤러리",
  resource: "자료실",
};

export default async function AdminCommunityBoardPage({ params }: { params: Promise<{ board: string }> }) {
  const { board } = await params;
  const boardLabel = boardNames[board] || board;
  const posts = await getPostsByBoard(board);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">{boardLabel} 관리</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> 글 작성
        </button>
      </div>

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-left px-4 py-3 font-medium">제목</th>
                <th className="text-center px-4 py-3 font-medium w-20 hidden sm:table-cell">조회</th>
                <th className="text-center px-4 py-3 font-medium w-28 hidden sm:table-cell">작성일</th>
                <th className="text-center px-4 py-3 font-medium w-24">상태</th>
                <th className="text-center px-4 py-3 font-medium w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {post.is_pinned && <Pin size={12} className="text-accent shrink-0" />}
                      <span className="text-text font-medium">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">{post.view_count || 0}</td>
                  <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">{post.created_at}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">공개</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 text-text-muted hover:text-primary"><Edit2 size={14} /></button>
                      <button className="p-1 text-text-muted hover:text-error"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-text-muted">게시글이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
