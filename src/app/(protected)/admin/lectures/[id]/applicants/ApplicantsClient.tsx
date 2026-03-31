"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectApplicants } from "@/lib/supabase/mutations";
import type { Application, Lecture } from "@/types";

const statusMap: Record<Application["status"], { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  deposit_pending: { label: "결제대기", cls: "bg-yellow-100 text-yellow-600" },
  submitted: { label: "접수완료", cls: "bg-blue-100 text-blue-600" },
  selected: { label: "선발", cls: "bg-green-100 text-green-700" },
  rejected: { label: "미선발", cls: "bg-red-100 text-red-400" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
};

interface Props {
  lecture: Lecture;
  applications: Application[];
}

export default function ApplicantsClient({ lecture, applications }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(applications.filter((a) => a.status === "selected").map((a) => a.id))
  );
  const [confirming, setConfirming] = useState(false);

  const maxSelect = lecture.max_applicants ?? lecture.required_count;
  const submitted = applications.filter((a) => a.status === "submitted" || a.status === "selected");
  const alreadyFinalized = applications.some(
    (a) => a.status === "selected" || a.status === "rejected"
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= maxSelect) {
          alert(`최대 ${maxSelect}명까지만 선발할 수 있습니다.`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }

  async function handleConfirm() {
    if (selectedIds.size === 0) {
      alert("선발할 지원자를 선택해주세요.");
      return;
    }
    if (
      !confirm(
        `${selectedIds.size}명을 선발 확정하시겠습니까?\n나머지 ${submitted.length - selectedIds.size}명은 미선발 처리됩니다.`
      )
    )
      return;

    setConfirming(true);
    try {
      await selectApplicants(lecture.id, Array.from(selectedIds));
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "선발 처리 실패");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* 선발 현황 */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-border-light p-4">
        <div className="text-sm text-text-sub">
          접수완료: <strong className="text-text">{submitted.length}명</strong> · 선택:{" "}
          <strong className="text-primary">{selectedIds.size}명</strong> / 최대{" "}
          <strong className="text-text">{maxSelect}명</strong>
        </div>
        {!alreadyFinalized ? (
          <button
            onClick={handleConfirm}
            disabled={confirming || selectedIds.size === 0}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {confirming ? "처리 중..." : "선발 확정"}
          </button>
        ) : (
          <span className="text-sm text-green-600 font-medium">선발 완료</span>
        )}
      </div>

      {/* 지원자 목록 */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center text-text-sub">
          아직 지원자가 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light">
                <th className="w-12 px-4 py-3 text-center text-text-sub font-medium">선발</th>
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
                const isSelectable = app.status === "submitted" || app.status === "selected";
                const isChecked = selectedIds.has(app.id);
                return (
                  <tr key={app.id} className={`hover:bg-surface/50 transition-colors ${isChecked ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3 text-center">
                      {isSelectable && !alreadyFinalized ? (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(app.id)}
                          className="w-4 h-4 accent-primary cursor-pointer"
                        />
                      ) : app.status === "selected" ? (
                        <span className="text-green-500">✓</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">
                      {app.applicant?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden sm:table-cell">
                      {app.applicant?.phone ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden md:table-cell">
                      {app.applicant?.specialties?.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden lg:table-cell">
                      {new Date(app.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {app.portfolio_url ? (
                        <a
                          href={app.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline"
                        >
                          다운로드
                        </a>
                      ) : (
                        <span className="text-text-sub text-xs">없음</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
