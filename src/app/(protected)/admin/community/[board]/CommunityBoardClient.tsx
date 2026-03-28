"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pin, Save, X, Edit2, Upload, Video, FileText } from "lucide-react";
import { createPost, updatePost, deletePost } from "@/lib/supabase/mutations";
import type { Post } from "@/types";

export default function CommunityBoardClient({
  board,
  boardLabel,
  posts,
}: {
  board: string;
  boardLabel: string;
  posts: Post[];
}) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const needsImage = board === "photo_gallery";
  const needsVideo = board === "video_gallery";
  const needsFile = board === "resource";

  const resetForm = () => {
    setTitle(""); setContent(""); setIsPinned(false);
    setVideoUrl(""); setFileUrl(""); setThumbnailUrl("");
    setShowForm(false); setEditingId(null);
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content || "");
    setIsPinned(post.is_pinned || false);
    setVideoUrl(post.video_url || "");
    setFileUrl(post.file_url || "");
    setThumbnailUrl(post.thumbnail_url || "");
    setShowForm(true);
  };

  const handleUpload = async (file: File, folder: string) => {
    if (file.size > 10 * 1024 * 1024) { setMsg({ type: "error", text: "파일 크기는 10MB 이하여야 합니다." }); return null; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "error", text: "업로드 실패: " + data.error }); return null; }
      return data.url as string;
    } catch { setMsg({ type: "error", text: "업로드에 실패했습니다." }); return null; }
    finally { setUploading(false); }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleUpload(file, "community/images");
    if (url) setThumbnailUrl(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleUpload(file, "community/files");
    if (url) setFileUrl(url);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        const postData = {
          title,
          content: content || null,
          is_pinned: isPinned,
          video_url: videoUrl || null,
          file_url: fileUrl || null,
          thumbnail_url: thumbnailUrl || null,
        };
        if (editingId) {
          await updatePost(editingId, postData);
          setMsg({ type: "success", text: "게시글이 수정되었습니다." });
        } else {
          await createPost({
            board_type: board,
            title,
            content: content || undefined,
            is_pinned: isPinned,
            video_url: videoUrl || undefined,
            file_url: fileUrl || undefined,
            thumbnail_url: thumbnailUrl || undefined,
          });
          setMsg({ type: "success", text: "게시글이 등록되었습니다." });
        }
        resetForm();
      } catch {
        setMsg({ type: "error", text: editingId ? "수정에 실패했습니다." : "등록에 실패했습니다." });
      }
    });
  };

  const handleDelete = (id: string, postTitle: string) => {
    if (!confirm(`"${postTitle}" 게시글을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deletePost(id, board);
        setMsg({ type: "success", text: "게시글이 삭제되었습니다." });
      } catch {
        setMsg({ type: "error", text: "삭제에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">{boardLabel} 관리</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> 글 작성
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>
      )}

      {showForm && (
        <div className="bg-white border border-primary/20 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-text mb-3">{editingId ? "글 수정" : "새 글 작성"}</h3>
          <div className="space-y-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목 *" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />

            {/* 사진갤러리: 이미지 업로드 */}
            {needsImage && (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이미지</label>
                {thumbnailUrl ? (
                  <div className="relative inline-block">
                    <img src={thumbnailUrl} alt="미리보기" className="h-32 rounded-lg object-cover" />
                    <button type="button" onClick={() => setThumbnailUrl("")} className="absolute top-1 right-1 bg-white/90 text-error px-1.5 py-0.5 rounded text-xs">삭제</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg text-sm text-text-sub cursor-pointer hover:border-primary/30">
                    <Upload size={14} /> {uploading ? "업로드 중..." : "이미지 선택 (PNG, JPG)"}
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {/* 영상갤러리: 영상 URL */}
            {needsVideo && (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">영상 URL</label>
                <div className="flex items-center gap-2">
                  <Video size={14} className="text-text-muted shrink-0" />
                  <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
            )}

            {/* 자료실: 파일 업로드 */}
            {needsFile && (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">첨부파일</label>
                {fileUrl ? (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="text-primary" />
                    <span className="text-text-sub truncate">{fileUrl.split("/").pop()}</span>
                    <button type="button" onClick={() => setFileUrl("")} className="text-error text-xs hover:underline">삭제</button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg text-sm text-text-sub cursor-pointer hover:border-primary/30">
                    <Upload size={14} /> {uploading ? "업로드 중..." : "파일 선택 (PDF, HWP, DOCX 등)"}
                    <input type="file" onChange={handleFileChange} disabled={uploading} className="hidden" />
                  </label>
                )}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="accent-primary" />
              상단 고정
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={isPending || uploading} className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50">
              <Save size={14} /> {isPending ? "저장 중..." : editingId ? "수정" : "등록"}
            </button>
            <button onClick={resetForm} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-text-sub border border-border-light hover:bg-surface">
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-left px-4 py-3 font-medium">제목</th>
                <th className="text-center px-4 py-3 font-medium w-20 hidden sm:table-cell">조회</th>
                <th className="text-center px-4 py-3 font-medium w-28 hidden sm:table-cell">작성일</th>
                <th className="text-center px-4 py-3 font-medium w-20">미디어</th>
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
                  <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">{post.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {post.thumbnail_url && <span title="이미지">🖼</span>}
                      {post.video_url && <span title="영상">🎬</span>}
                      {post.file_url && <span title="파일">📎</span>}
                      {!post.thumbnail_url && !post.video_url && !post.file_url && <span className="text-text-muted">-</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => startEdit(post)} disabled={isPending} className="p-1 text-text-muted hover:text-primary disabled:opacity-50"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(post.id, post.title)} disabled={isPending} className="p-1 text-text-muted hover:text-error disabled:opacity-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-sm text-text-muted">게시글이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
