import { getCurrentUser, getPaymentsByUser } from "@/lib/supabase/queries";
import { getApplicationsByUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export const metadata = { title: "예치금 관리" };

const depositStatusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: "결제 대기", cls: "bg-yellow-100 text-yellow-600" },
  completed: { label: "결제완료", cls: "bg-blue-100 text-blue-600" },
  failed: { label: "결제실패", cls: "bg-red-100 text-red-500" },
  cancelled: { label: "취소", cls: "bg-gray-100 text-gray-400" },
  refunded: { label: "환불완료", cls: "bg-green-100 text-green-700" },
};

export default async function DepositsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/mypage/deposits");

  const [allPayments, applications] = await Promise.all([
    getPaymentsByUser(user.id),
    getApplicationsByUser(user.id),
  ]);

  const deposits = allPayments.filter((p) => p.payment_type === "deposit");

  // 지원 레코드와 매핑 (lecture 제목 표시용)
  const appMap = new Map(applications.map((a) => [a.deposit_payment_id, a]));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-text mb-2">예치금 관리</h1>
      <p className="text-sm text-text-sub mb-6">
        강사 지원 시 납부한 예치금 내역입니다. 미선발 시 3영업일 이내 전액 환불됩니다.
      </p>

      {/* 환불 정책 안내 */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <strong className="block mb-1">예치금 환불 정책</strong>
        <ul className="list-disc list-inside space-y-1 text-blue-600">
          <li>선발된 경우: 예치금은 강사료에서 차감됩니다.</li>
          <li>미선발된 경우: 선발 발표일로부터 3영업일 이내 전액 환불됩니다.</li>
          <li>지원 취소 시: 서류 제출 완료 전까지만 취소 가능합니다.</li>
        </ul>
      </div>

      {deposits.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-light p-12 text-center text-text-sub">
          예치금 결제 내역이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light">
                <th className="text-left px-4 py-3 text-text-sub font-medium">강의명</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium hidden sm:table-cell">결제일</th>
                <th className="text-right px-4 py-3 text-text-sub font-medium">금액</th>
                <th className="text-left px-4 py-3 text-text-sub font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {deposits.map((payment) => {
                const app = appMap.get(payment.id);
                const statusInfo = depositStatusMap[payment.status] ?? {
                  label: payment.status,
                  cls: "bg-gray-100 text-gray-500",
                };
                return (
                  <tr key={payment.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-text">
                      {app?.lecture?.title ?? "강의공고"}
                    </td>
                    <td className="px-4 py-3 text-text-sub hidden sm:table-cell">
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString("ko-KR")
                        : new Date(payment.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-right text-text font-medium">
                      {payment.amount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>
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
