import { getCurrentUser, getApplicationsByUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ApplicationStatus } from "@/types";

export const metadata = { title: "지원이력" };

const statusLabels: Record<ApplicationStatus, { label: string; cls: string }> = {
  pending: { label: "대기중", cls: "bg-gray-100 text-gray-500" },
  deposit_pending: { label: "예치금 결제 대기", cls: "bg-yellow-100 text-yellow-600" },
  submitted: { label: "접수완료", cls: "bg-blue-100 text-blue-600" },
  selected: { label: "선발됨", cls: "bg-green-100 text-green-700" },
  rejected: { label: "미선발", cls: "bg-red-100 text-red-500" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
};

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/mypage/applications");

  const applications = await getApplicationsByUser(user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">지원이력</h1>
        <Link href="/lectures" className="text-sm text-primary hover:underline">
          강의공고 보기 →
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center">
          <p className="text-text-sub mb-4">아직 지원한 강의공고가 없습니다.</p>
          <Link
            href="/lectures"
            className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            강의공고 보러가기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light">
                <th className="text-left px-4 py-3 text-text-sub font-medium">강의명</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden sm:table-cell">강의 일자</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden md:table-cell">지원일</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {applications.map((app) => {
                const statusInfo = statusLabels[app.status];
                return (
                  <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      {app.lecture ? (
                        <Link
                          href={`/lectures/${app.lecture_id}`}
                          className="text-text font-medium hover:text-primary transition-colors"
                        >
                          {app.lecture.title}
                        </Link>
                      ) : (
                        <span className="text-text">(삭제된 공고)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden sm:table-cell">
                      {app.lecture?.lecture_date ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden md:table-cell">
                      {new Date(app.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>
                      {app.status === "deposit_pending" && (
                        <Link
                          href={`/lectures/${app.lecture_id}`}
                          className="ml-2 text-xs text-primary underline"
                        >
                          결제하기
                        </Link>
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
