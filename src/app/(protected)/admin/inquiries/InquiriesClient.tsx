"use client";

import { useTransition, useState } from "react";
import { CheckCircle, Clock, AlertCircle, BookOpen } from "lucide-react";
import { updateInquiryStatus, approveEnrollment } from "@/lib/supabase/mutations";
import type { Inquiry, Enrollment } from "@/types";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "신규", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  in_progress: { label: "처리중", color: "bg-amber-100 text-amber-800", icon: Clock },
  completed: { label: "완료", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

const enrollStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-gray-100 text-gray-700" },
  approved: { label: "승인완료", color: "bg-blue-100 text-blue-700" },
  paid: { label: "결제완료", color: "bg-green-100 text-green-700" },
  completed: { label: "수료", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "취소", color: "bg-red-100 text-red-700" },
};

export default function InquiriesClient({
  inquiries,
  enrollments,
}: {
  inquiries: Inquiry[];
  enrollments: Enrollment[];
}) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState<{ enrollmentId: string; programName: string } | null>(null);
  const [feeInput, setFeeInput] = useState("");

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateInquiryStatus(id, status);
        setMsg("상태가 변경되었습니다.");
        setTimeout(() => setMsg(null), 2000);
      } catch {
        setMsg("상태 변경에 실패했습니다.");
      }
    });
  };

  const handleApprove = () => {
    if (!approveModal || !feeInput) return;
    const fee = Number(feeInput);
    if (isNaN(fee) || fee <= 0) {
      setMsg("올바른 수강료를 입력해주세요.");
      return;
    }
    startTransition(async () => {
      try {
        await approveEnrollment(approveModal.enrollmentId, fee);
        setMsg("수강이 승인되었습니다. 회원이 결제할 수 있습니다.");
        setApproveModal(null);
        setFeeInput("");
        setTimeout(() => setMsg(null), 3000);
      } catch {
        setMsg("수강 승인에 실패했습니다.");
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">교육문의 관리</h1>

      {msg && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-700">{msg}</div>
      )}

      {/* 수강 승인 모달 */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-text mb-4">수강 승인</h3>
            <p className="text-sm text-text-sub mb-4">
              <strong>{approveModal.programName}</strong> 과정의 수강료를 입력하세요.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-1">수강료 (원)</label>
              <input
                type="number"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                placeholder="예: 300000"
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isPending ? "처리 중..." : "승인"}
              </button>
              <button
                onClick={() => { setApproveModal(null); setFeeInput(""); }}
                className="flex-1 bg-gray-100 text-text py-2 rounded-lg text-sm font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수강 신청 목록 */}
      {enrollments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <BookOpen size={18} />
            수강 신청 관리
          </h2>
          <div className="space-y-3">
            {enrollments.map((enr) => {
              const est = enrollStatusConfig[enr.status] || enrollStatusConfig.pending;
              return (
                <div key={enr.id} className="bg-white border border-border-light rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-text">
                          {(enr.program as unknown as { title: string })?.title || "교육과정"}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${est.color}`}>{est.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-text-muted">
                        <span>{(enr.profile as unknown as { name: string })?.name || "회원"}</span>
                        <span>{(enr.profile as unknown as { email: string })?.email || ""}</span>
                        {enr.fee && <span className="text-primary font-medium">{enr.fee.toLocaleString()}원</span>}
                        <span>{enr.created_at?.slice(0, 10)}</span>
                      </div>
                    </div>
                    {enr.status === "pending" && (
                      <button
                        onClick={() => setApproveModal({
                          enrollmentId: enr.id,
                          programName: (enr.program as unknown as { title: string })?.title || "교육과정",
                        })}
                        disabled={isPending}
                        className="shrink-0 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        수강 승인
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 기존 문의 목록 */}
      <h2 className="text-lg font-bold text-text mb-4">교육문의 목록</h2>
      <div className="space-y-3">
        {inquiries.map((inq) => {
          const st = statusConfig[inq.status] || statusConfig.new;
          return (
            <div key={inq.id} className="bg-white border border-border-light rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text">{inq.company_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-sm text-text-sub">{inq.message}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                    <span>{inq.contact_name}</span>
                    <span>{inq.contact_email}</span>
                    <span>{inq.contact_phone}</span>
                    <span>{inq.created_at}</span>
                  </div>
                </div>
                <select
                  defaultValue={inq.status}
                  disabled={isPending}
                  className="shrink-0 text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none disabled:opacity-50"
                  onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                >
                  <option value="new">신규</option>
                  <option value="in_progress">처리중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
          );
        })}
        {inquiries.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">문의 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
