import { getPayments } from "@/lib/supabase/queries";
import { CreditCard, Receipt } from "lucide-react";

export default async function AdminPaymentsPage() {
  const payments = await getPayments();
  const totalAmount = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">결제 내역</h1>

      {/* 요약 */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border-light rounded-xl p-5 text-center">
          <p className="text-xs text-text-muted">총 결제 건수</p>
          <p className="text-2xl font-bold text-text mt-1">{payments.length}</p>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5 text-center">
          <p className="text-xs text-text-muted">완료 건수</p>
          <p className="text-2xl font-bold text-success mt-1">{payments.filter((p) => p.status === "completed").length}</p>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5 text-center">
          <p className="text-xs text-text-muted">총 결제 금액</p>
          <p className="text-2xl font-bold text-accent mt-1">{totalAmount.toLocaleString()}원</p>
        </div>
      </div>

      {/* 결제 테이블 */}
      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-left px-4 py-3 font-medium">회원</th>
                <th className="text-left px-4 py-3 font-medium">구분</th>
                <th className="text-right px-4 py-3 font-medium">금액</th>
                <th className="text-center px-4 py-3 font-medium">상태</th>
                <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">결제일</th>
                <th className="text-center px-4 py-3 font-medium hidden md:table-cell">기간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {payments.map((p) => {
                const profile = (p as unknown as Record<string, unknown>).profiles as { name?: string; email?: string } | null;
                return (
                  <tr key={p.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-text">{profile?.name || "-"}</td>
                    <td className="px-4 py-3 text-text-sub">{p.payment_type === "annual_membership" ? "연간 협회비" : "자격증 수수료"}</td>
                    <td className="px-4 py-3 text-right font-medium text-text">{p.amount.toLocaleString()}원</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${p.status === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {p.status === "completed" ? "완료" : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-text-muted hidden sm:table-cell">{p.paid_at || "-"}</td>
                    <td className="px-4 py-3 text-center text-xs text-text-muted hidden md:table-cell">{p.period_start} ~ {p.period_end}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
