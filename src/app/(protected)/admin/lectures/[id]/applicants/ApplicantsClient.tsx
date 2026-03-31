"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectApplicants, updateApplication } from "@/lib/supabase/mutations";
import type { Application, Lecture } from "@/types";
import { X, FileText, ExternalLink } from "lucide-react";

const statusMap: Record<Application["status"], { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  deposit_pending: { label: "결제대기", cls: "bg-yellow-100 text-yellow-600" },
  submitted: { label: "접수완료", cls: "bg-blue-100 text-blue-600" },
  selected: { label: "강사확정", cls: "bg-green-100 text-green-700" },
  confirmed: { label: "최종확정", cls: "bg-emerald-100 text-emerald-700" },
  standby: { label: "예비강사", cls: "bg-amber-100 text-amber-600" },
  rejected: { label: "미선발", cls: "bg-red-100 text-red-400" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
};

type SelectionType = "none" | "selected" | "standby";

interface Props {
  lecture: Lecture;
  applications: Application[];
}

function isImageFile(name: string) {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
}

function isPdfFile(name: string) {
  return /\.pdf$/i.test(name);
}

export default function ApplicantsClient({ lecture, applications }: Props) {
  const router = useRouter();

  const [selections, setSelections] = useState<Record<string, SelectionType>>(() => {
    const init: Record<string, SelectionType> = {};
    applications.forEach((a) => {
      if (a.status === "selected" || a.status === "confirmed") init[a.id] = "selected";
      else if (a.status === "standby") init[a.id] = "standby";
      else init[a.id] = "none";
    });
    return init;
  });

  const [confirming, setConfirming] = useState(false);
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  const maxSelected = lecture.required_count;
  const maxStandby = Math.ceil(lecture.required_count * 0.5);

  const submitted = applications.filter(
    (a) => a.status === "submitted" || a.status === "selected" || a.status === "confirmed" || a.status === "standby"
  );
  const alreadyFinalized = applications.some(
    (a) => a.status === "selected" || a.status === "confirmed" || a.status === "standby" || a.status === "rejected"
  );

  const selectedCount = Object.values(selections).filter((v) => v === "selected").length;
  const standbyCount = Object.values(selections).filter((v) => v === "standby").length;

  function setSelection(id: string, type: SelectionType) {
    if (type === "selected" && selectedCount >= maxSelected && selections[id] !== "selected") {
      alert(`강사확정은 최대 ${maxSelected}명까지 가능합니다.`);
      return;
    }
    if (type === "standby" && standbyCount >= maxStandby && selections[id] !== "standby") {
      alert(`예비강사는 최대 ${maxStandby}명까지 가능합니다.`);
      return;
    }
    setSelections((prev) => ({ ...prev, [id]: type }));
  }

  // 모달에서도 선발구분 변경 가능
  function setDetailSelection(type: SelectionType) {
    if (!detailApp) return;
    setSelection(detailApp.id, type);
  }

  async function handleConfirm() {
    const selectedIds = Object.entries(selections).filter(([, v]) => v === "selected").map(([id]) => id);
    const standbyIds = Object.entries(selections).filter(([, v]) => v === "standby").map(([id]) => id);

    if (selectedIds.length === 0 && standbyIds.length === 0) {
      alert("강사확정 또는 예비강사를 선택해주세요.");
      return;
    }

    const remaining = submitted.length - selectedIds.length - standbyIds.length;
    const msg = [
      `강사확정: ${selectedIds.length}명`,
      standbyIds.length > 0 ? `예비강사: ${standbyIds.length}명` : null,
      remaining > 0 ? `미선발: ${remaining}명` : null,
    ].filter(Boolean).join(", ");

    if (!confirm(`${msg}\n\n위 내용으로 선발을 확정하시겠습니까?`)) return;

    setConfirming(true);
    try {
      await selectApplicants(lecture.id, selectedIds, standbyIds);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "선발 처리 실패");
    } finally {
      setConfirming(false);
    }
  }

  function openDetail(app: Application) {
    setDetailApp(app);
    setAdminNote(app.admin_note ?? "");
  }

  async function handleSaveNote() {
    if (!detailApp) return;
    setSavingNote(true);
    try {
      await updateApplication(detailApp.id, { admin_note: adminNote });
      router.refresh();
    } catch {
      alert("메모 저장 실패");
    } finally {
      setSavingNote(false);
    }
  }

  function openPreview(url: string, name: string) {
    setPreviewUrl(url);
    setPreviewName(name);
  }

  return (
    <div className="space-y-4">
      {/* 선발 현황 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-border-light p-4">
        <div className="text-sm text-text-sub space-x-3">
          <span>접수: <strong className="text-text">{submitted.length}명</strong></span>
          <span>강사확정: <strong className="text-green-600">{selectedCount}</strong>/{maxSelected}명</span>
          <span>예비강사: <strong className="text-amber-600">{standbyCount}</strong>/{maxStandby}명</span>
        </div>
        {!alreadyFinalized ? (
          <button onClick={handleConfirm} disabled={confirming || (selectedCount === 0 && standbyCount === 0)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {confirming ? "처리 중..." : "선발 확정"}
          </button>
        ) : (
          <span className="text-sm text-green-600 font-medium">선발 완료</span>
        )}
      </div>

      {/* 지원자 목록 */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center text-text-sub">아직 지원자가 없습니다.</div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light">
                <th className="text-left px-4 py-3 text-text-sub font-medium">이름</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden sm:table-cell">연락처</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden md:table-cell">전문분야</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden lg:table-cell">지원일</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium">상태</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden md:table-cell">서류</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {applications.map((app) => {
                const st = statusMap[app.status];
                const sel = selections[app.id] ?? "none";
                const docCount = (app.document_urls?.length ?? 0) + (app.cover_letter ? 1 : 0);

                return (
                  <tr
                    key={app.id}
                    onClick={() => openDetail(app)}
                    className={`cursor-pointer hover:bg-surface/50 transition-colors ${
                      sel === "selected" ? "bg-green-50/50" : sel === "standby" ? "bg-amber-50/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-text">{app.applicant?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-text-sub hidden sm:table-cell">{app.applicant?.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-text-sub hidden md:table-cell">{app.applicant?.specialties?.join(", ") || "-"}</td>
                    <td className="px-4 py-3 text-text-sub hidden lg:table-cell">{new Date(app.created_at).toLocaleDateString("ko-KR")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {docCount > 0 ? (
                        <span className="text-xs text-primary">{docCount}건</span>
                      ) : (
                        <span className="text-xs text-text-muted">없음</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 지원자 상세 모달 */}
      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailApp(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* 헤더 */}
            <div className="px-6 pt-5 pb-3 border-b border-border-light flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-text">{detailApp.applicant?.name ?? "지원자"}</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {detailApp.applicant?.email} · {detailApp.applicant?.phone ?? "연락처 미등록"}
                </p>
              </div>
              <button onClick={() => setDetailApp(null)} className="text-text-muted hover:text-text"><X size={20} /></button>
            </div>

            {/* 내용 */}
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5">

              {/* 선발구분 라디오 */}
              {(detailApp.status === "submitted" || detailApp.status === "selected" || detailApp.status === "standby") && !alreadyFinalized && (
                <div className="bg-surface rounded-lg p-4">
                  <h3 className="font-semibold text-text text-sm mb-3">선발 결정</h3>
                  <div className="flex gap-4">
                    {([
                      { value: "selected" as SelectionType, label: "강사확정", color: "text-green-600 border-green-400 bg-green-50" },
                      { value: "standby" as SelectionType, label: "예비강사", color: "text-amber-600 border-amber-400 bg-amber-50" },
                      { value: "none" as SelectionType, label: "미정", color: "text-gray-500 border-gray-300 bg-gray-50" },
                    ]).map((opt) => {
                      const sel = selections[detailApp.id] ?? "none";
                      const isActive = sel === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                            isActive ? opt.color + " border-current" : "border-border-light text-text-sub hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="selection"
                            value={opt.value}
                            checked={isActive}
                            onChange={() => setDetailSelection(opt.value)}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 이미 확정된 경우 상태 표시 */}
              {alreadyFinalized && (
                <div className={`rounded-lg p-3 text-sm font-medium text-center ${statusMap[detailApp.status]?.cls ?? ""}`}>
                  {statusMap[detailApp.status]?.label}
                </div>
              )}

              {/* 프로필 */}
              <div className="bg-surface rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-text mb-2">프로필</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-text-sub/60">전문분야:</span> <span className="text-text">{detailApp.applicant?.specialties?.join(", ") || "-"}</span></div>
                  <div><span className="text-text-sub/60">지원일:</span> <span className="text-text">{new Date(detailApp.created_at).toLocaleDateString("ko-KR")}</span></div>
                </div>
                {detailApp.applicant?.bio && (
                  <div className="mt-2 pt-2 border-t border-border-light">
                    <span className="text-text-sub/60 text-xs">소개:</span>
                    <p className="text-text mt-1">{detailApp.applicant.bio}</p>
                  </div>
                )}
              </div>

              {/* 자기소개서 */}
              {detailApp.cover_letter && (
                <div>
                  <h3 className="font-semibold text-text mb-2 text-sm">자기소개서</h3>
                  <div className="bg-surface rounded-lg p-4 text-sm text-text-sub whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {detailApp.cover_letter}
                  </div>
                </div>
              )}

              {/* 첨부 서류 (인라인 미리보기) */}
              {detailApp.document_urls && detailApp.document_urls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text mb-2 text-sm">첨부 서류 ({detailApp.document_urls.length}건)</h3>
                  <div className="space-y-2">
                    {detailApp.document_urls.map((doc: { name: string; url: string }, i: number) => {
                      const canPreview = isImageFile(doc.name) || isPdfFile(doc.name);
                      return (
                        <div key={i} className="bg-surface rounded-lg overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5">
                            <FileText size={14} className="text-primary shrink-0" />
                            <span className="text-sm text-text flex-1 truncate">{doc.name}</span>
                            {canPreview && (
                              <button
                                onClick={() => openPreview(doc.url, doc.name)}
                                className="text-xs text-primary hover:underline shrink-0"
                              >
                                미리보기
                              </button>
                            )}
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              <ExternalLink size={14} className="text-text-muted hover:text-primary" />
                            </a>
                          </div>
                          {/* 이미지 인라인 프리뷰 */}
                          {isImageFile(doc.name) && (
                            <div className="px-4 pb-3">
                              <img src={doc.url} alt={doc.name} className="max-h-48 rounded-lg border border-border-light object-contain" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 관리자 메모 */}
              <div>
                <h3 className="font-semibold text-text mb-2 text-sm">관리자 메모</h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="관리자 메모를 입력하세요..."
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button onClick={handleSaveNote} disabled={savingNote} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                    {savingNote ? "저장 중..." : "메모 저장"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 파일 미리보기 모달 (PDF/이미지 전체 화면) */}
      {previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewUrl(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-border-light flex items-center justify-between shrink-0">
              <span className="text-sm font-medium text-text truncate">{previewName}</span>
              <div className="flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">새 탭에서 열기</a>
                <button onClick={() => setPreviewUrl(null)} className="text-text-muted hover:text-text"><X size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {isPdfFile(previewName) ? (
                <iframe src={previewUrl} className="w-full h-full" title={previewName} />
              ) : isImageFile(previewName) ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                  <img src={previewUrl} alt={previewName} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-text-sub">
                  <p>이 파일은 미리보기를 지원하지 않습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
