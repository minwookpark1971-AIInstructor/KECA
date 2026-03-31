"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateApplicationDocuments, deleteApplicationFile } from "@/lib/supabase/mutations";
import { useToast } from "@/components/layout/Toast";
import { FileText, Upload, X, Trash2 } from "lucide-react";

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ACCEPTED_EXTENSIONS = ".pdf,.hwpx,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

interface Props {
  applicationId: string;
  userId: string;
  status: string;
  initialDocs: { name: string; url: string }[];
  initialCoverLetter: string;
}

export default function DocumentManager({ applicationId, userId, status, initialDocs, initialCoverLetter }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState(initialDocs);
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canEdit = ["pending", "submitted"].includes(status);
  const totalCount = docs.length + newFiles.length;

  if (!canEdit) return null;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    if (totalCount + selected.length > MAX_FILES) {
      setError(`최대 ${MAX_FILES}개까지 업로드할 수 있습니다.`);
      return;
    }
    const oversized = selected.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setError(`${oversized.name}: 파일 크기가 ${MAX_SIZE_MB}MB를 초과합니다.`);
      return;
    }
    const existingNames = new Set([...docs.map((d) => d.name), ...newFiles.map((f) => f.name)]);
    const dup = selected.find((f) => existingNames.has(f.name));
    if (dup) {
      setError(`${dup.name}: 이미 추가된 파일입니다.`);
      return;
    }

    setError(null);
    setNewFiles((prev) => [...prev, ...selected]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeleteExisting(doc: { name: string; url: string }) {
    if (!confirm(`"${doc.name}" 파일을 삭제하시겠습니까?`)) return;
    setDeleting(doc.url);
    try {
      await deleteApplicationFile(applicationId, userId, doc.url);
      setDocs((prev) => prev.filter((d) => d.url !== doc.url));
      toast("success", "파일이 삭제되었습니다.");
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "파일 삭제 실패");
    } finally {
      setDeleting(null);
    }
  }

  async function handleSave() {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const uploadedDocs = [...docs];

      // 새 파일 업로드
      for (const file of newFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `applications/${applicationId}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("portfolios")
          .upload(path, file, { upsert: true });
        if (uploadError) throw new Error(`${file.name} 업로드 실패: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from("portfolios").getPublicUrl(path);
        uploadedDocs.push({ name: file.name, url: urlData.publicUrl });
      }

      await updateApplicationDocuments(
        applicationId,
        userId,
        uploadedDocs,
        coverLetter,
        status === "pending" // pending이면 자동으로 submitted 전환
      );

      setDocs(uploadedDocs);
      setNewFiles([]);
      toast("success", status === "pending" && (uploadedDocs.length > 0 || coverLetter.trim())
        ? "서류가 제출되어 접수 완료 상태로 전환되었습니다."
        : "서류가 저장되었습니다."
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  const hasChanges = newFiles.length > 0 || coverLetter !== initialCoverLetter;

  return (
    <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 mb-4">
      <h2 className="text-lg font-bold text-text mb-4">서류 관리</h2>

      {status === "pending" && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          서류를 제출하면 접수 완료 상태로 자동 전환됩니다.
        </div>
      )}

      {/* 자기소개서 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text mb-1.5">자기소개서</label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={4}
          placeholder="강의 경력 및 지원 동기를 작성해주세요."
          className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* 기존 첨부 서류 */}
      {docs.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-text mb-1.5">첨부된 서류</label>
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.url} className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2">
                <FileText size={14} className="text-primary shrink-0" />
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-text flex-1 truncate hover:text-primary">
                  {doc.name}
                </a>
                <button
                  onClick={() => handleDeleteExisting(doc)}
                  disabled={deleting === doc.url}
                  className="text-text-muted hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
                >
                  {deleting === doc.url ? <span className="text-xs">삭제중</span> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 새로 추가할 파일 */}
      {newFiles.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-text mb-1.5">새로 추가할 파일</label>
          <div className="space-y-2">
            {newFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                <FileText size={14} className="text-green-600 shrink-0" />
                <span className="text-sm text-text flex-1 truncate">{file.name}</span>
                <span className="text-xs text-text-muted shrink-0">{formatFileSize(file.size)}</span>
                <button onClick={() => removeNewFile(i)} className="text-text-muted hover:text-red-500 transition-colors shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 파일 추가 버튼 */}
      <input ref={fileRef} type="file" accept={ACCEPTED_EXTENSIONS} multiple onChange={handleFilesChange} className="hidden" />
      {totalCount < MAX_FILES && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-border-light rounded-lg px-4 py-3 text-sm text-text-sub hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Upload size={14} />
          파일 추가 ({totalCount}/{MAX_FILES})
        </button>
      )}

      <p className="text-xs text-text-muted mb-4">PDF, HWPX, PPT, Word, 이미지(JPG/PNG) | 각 {MAX_SIZE_MB}MB 이하</p>

      {error && <p className="mb-3 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {/* 저장 버튼 */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={uploading}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {uploading ? "저장 중..." : status === "pending" ? "서류 제출하기" : "변경사항 저장"}
        </button>
      )}
    </div>
  );
}
