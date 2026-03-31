import { getCurrentUser, getApplicationById, getStatusHistory } from "@/lib/supabase/queries";
import { markApplicationResultRead } from "@/lib/supabase/mutations";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { ApplicationStatus } from "@/types";
import { ArrowLeft, CreditCard, Clock, MapPin, Calendar, FileText } from "lucide-react";
import DocumentManager from "./DocumentManager";
import CancelButton from "./CancelButton";

export const metadata = { title: "지원 상세" };

const statusLabels: Record<ApplicationStatus, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  deposit_pending: { label: "보증금 결제 대기", cls: "bg-yellow-100 text-yellow-600" },
  submitted: { label: "접수완료", cls: "bg-blue-100 text-blue-600" },
  reviewing: { label: "심사중", cls: "bg-yellow-100 text-yellow-700" },
  selected: { label: "강사확정", cls: "bg-green-100 text-green-700" },
  confirmed: { label: "최종확정", cls: "bg-emerald-100 text-emerald-700" },
  standby: { label: "예비강사", cls: "bg-amber-100 text-amber-600" },
  rejected: { label: "미선발", cls: "bg-red-100 text-red-500" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
};

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/mypage/applications");

  const app = await getApplicationById(id);
  if (!app || app.applicant_id !== user.id) notFound();

  const history = await getStatusHistory(id);

  // 결과 확인 시 읽음 처리
  if (app.is_result_read === false && ["selected", "confirmed", "standby", "rejected"].includes(app.status)) {
    markApplicationResultRead(id).catch(() => {});
  }

  const statusInfo = statusLabels[app.status];
  const canCancel = ["pending", "submitted", "reviewing"].includes(app.status);
  const canEditDocs = ["pending", "submitted"].includes(app.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* 헤더 */}
      <Link href="/mypage/applications" className="inline-flex items-center gap-1.5 text-sm text-text-sub hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} />
        지원이력
      </Link>

      {/* 강의 정보 */}
      <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text">{app.lecture?.title ?? "(삭제된 공고)"}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-text-sub">
              {app.lecture?.lecture_date && (
                <span className="flex items-center gap-1"><Calendar size={14} /> {app.lecture.lecture_date}</span>
              )}
              {app.lecture?.location && (
                <span className="flex items-center gap-1"><MapPin size={14} /> {app.lecture.location}</span>
              )}
            </div>
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* 선발 결과 영역 */}
      <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 mb-4">
        <h2 className="text-lg font-bold text-text mb-4">선발 결과</h2>

        {(app.status === "selected") && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-semibold text-green-700 text-lg">축하합니다! 강사로 확정되었습니다.</p>
            {app.selected_at && (
              <p className="text-sm text-green-600 mt-2">확정일: {new Date(app.selected_at).toLocaleDateString("ko-KR")}</p>
            )}
            <p className="text-sm text-green-600 mt-1">보증금 결제를 완료하시면 최종 확정됩니다.</p>
            <Link
              href={`/mypage/applications/deposit-pay?applicationId=${app.id}&lectureTitle=${encodeURIComponent(app.lecture?.title || "강의")}`}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <CreditCard size={16} />
              보증금 결제하기 (30,000원)
            </Link>
          </div>
        )}

        {app.status === "confirmed" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-semibold text-emerald-700 text-lg">최종 확정되었습니다.</p>
            <p className="text-sm text-emerald-600 mt-2">보증금 결제가 완료되었습니다. 담당자가 곧 연락드리겠습니다.</p>
            {app.lecture?.lecture_date && (
              <p className="text-sm text-emerald-600 mt-1">강의 준비사항이 별도로 안내될 예정입니다.</p>
            )}
          </div>
        )}

        {app.status === "standby" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
            <p className="text-2xl mb-2">🔵</p>
            <p className="font-semibold text-amber-700 text-lg">
              예비강사로 선정되었습니다.{app.standby_rank ? ` (${app.standby_rank}순위)` : ""}
            </p>
            <p className="text-sm text-amber-600 mt-2">확정 강사 변동 시 우선 연락드리겠습니다.</p>
          </div>
        )}

        {app.status === "rejected" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
            <p className="font-semibold text-gray-600 text-lg">아쉽게도 이번 강의에 선발되지 않았습니다.</p>
            {(app.rejection_reason || app.admin_note) && (
              <p className="text-sm text-gray-500 mt-3 bg-white rounded-lg p-3 border border-gray-100">
                {app.rejection_reason || app.admin_note}
              </p>
            )}
            <Link href="/lectures" className="mt-4 inline-block text-sm text-primary hover:underline">
              다른 강의공고 보기 →
            </Link>
          </div>
        )}

        {app.status === "cancelled" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
            <p className="font-semibold text-gray-600">지원이 취소되었습니다.</p>
          </div>
        )}

        {(app.status === "pending" || app.status === "submitted" || app.status === "reviewing") && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center">
            <p className="text-2xl mb-2">⏳</p>
            <p className="font-semibold text-blue-700">
              {app.status === "pending" ? "서류 제출을 완료해주세요." :
               app.status === "reviewing" ? "현재 심사가 진행 중입니다." :
               "지원이 접수되었습니다."}
            </p>
            <p className="text-sm text-blue-600 mt-2">결과가 나오면 알려드리겠습니다.</p>
          </div>
        )}
      </div>

      {/* 서류 관리 (pending/submitted 상태에서만) */}
      {canEditDocs && (
        <DocumentManager
          applicationId={app.id}
          userId={user.id}
          status={app.status}
          initialDocs={app.document_urls ?? []}
          initialCoverLetter={app.cover_letter ?? ""}
        />
      )}

      {/* 나의 지원 정보 (서류 편집 불가 상태에서만 읽기 전용 표시) */}
      {!canEditDocs && (
        <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 mb-4">
          <h2 className="text-lg font-bold text-text mb-4">나의 지원 정보</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-text-sub/60 w-20 shrink-0">지원일</span>
              <span className="text-text">{new Date(app.created_at).toLocaleDateString("ko-KR")}</span>
            </div>
            {app.cover_letter && (
              <div>
                <span className="text-text-sub/60 block mb-1">자기소개서</span>
                <p className="text-text bg-surface rounded-lg p-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {app.cover_letter}
                </p>
              </div>
            )}
            {app.document_urls && app.document_urls.length > 0 && (
              <div>
                <span className="text-text-sub/60 block mb-1">제출 서류 ({app.document_urls.length}건)</span>
                <div className="space-y-1">
                  {app.document_urls.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.name} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <FileText size={14} /> {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 진행 경과 타임라인 */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-border-light p-5 sm:p-6 mb-4">
          <h2 className="text-lg font-bold text-text mb-4">진행 경과</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-surface flex items-center justify-center shrink-0">
                  <Clock size={12} className="text-text-muted" />
                </div>
                <div>
                  <p className="text-sm text-text">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${statusLabels[h.new_status]?.cls ?? "bg-gray-100 text-gray-500"}`}>
                      {statusLabels[h.new_status]?.label ?? h.new_status}
                    </span>
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(h.changed_at).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-surface flex items-center justify-center shrink-0">
                <Clock size={12} className="text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text">지원 접수</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(app.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지원 취소 버튼 */}
      {canCancel && (
        <CancelButton applicationId={app.id} userId={user.id} mode="cancel" />
      )}

      {/* 취소된 지원 삭제 버튼 */}
      {app.status === "cancelled" && (
        <CancelButton applicationId={app.id} userId={user.id} mode="delete" />
      )}
    </div>
  );
}
