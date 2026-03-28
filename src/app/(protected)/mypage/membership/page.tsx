import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getCurrentUser, getPaymentsByUser } from "@/lib/supabase/queries";
import { CreditCard, CheckCircle, AlertCircle, Receipt, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "협회비 납부" };

export default async function MembershipPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payments = await getPaymentsByUser(user.id);
  const isPaid = user.role === "member" || user.role === "instructor" || user.role === "admin";
  const isExpiringSoon = user.membership_expires_at
    ? new Date(user.membership_expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <>
      <SubpageHero
        title="협회비 납부"
        breadcrumb={[{ label: "마이페이지", href: "/mypage" }, { label: "협회비 납부" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          {/* 현재 상태 카드 */}
          <div className={`rounded-2xl p-6 lg:p-8 mb-8 border ${isPaid ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-start gap-4">
              {isPaid ? (
                <CheckCircle size={28} className="text-green-600 shrink-0" />
              ) : (
                <AlertCircle size={28} className="text-amber-600 shrink-0" />
              )}
              <div>
                <h2 className="text-lg font-bold text-text">
                  {isPaid ? "협회비 납부 완료" : "협회비 미납"}
                </h2>
                {isPaid && user.membership_expires_at ? (
                  <p className="text-sm text-text-sub mt-1">
                    유효 기간: <strong>{user.membership_paid_at}</strong> ~ <strong>{user.membership_expires_at}</strong>
                    {isExpiringSoon && (
                      <span className="ml-2 text-amber-600 font-medium">곧 만료됩니다</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-text-sub mt-1">
                    정회원 혜택을 이용하시려면 협회비를 납부해 주세요.
                  </p>
                )}
              </div>
            </div>

            {(!isPaid || isExpiringSoon) && (
              <Link
                href="/mypage/membership/pay"
                className="inline-flex items-center gap-2 mt-4 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                <CreditCard size={16} />
                {isPaid ? "갱신하기" : "납부하기"}
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* 결제 내역 */}
          <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-8">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <Receipt size={20} /> 결제 내역
            </h3>

            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-light text-text-sub">
                      <th className="text-left py-3 px-2 font-medium">결제일</th>
                      <th className="text-left py-3 px-2 font-medium">구분</th>
                      <th className="text-right py-3 px-2 font-medium">금액</th>
                      <th className="text-center py-3 px-2 font-medium">상태</th>
                      <th className="text-center py-3 px-2 font-medium">기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-2 text-text">{p.paid_at || p.created_at}</td>
                        <td className="py-3 px-2 text-text-sub">
                          {p.payment_type === "annual_membership" ? "연간 협회비" : "자격증 수수료"}
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-text">
                          {p.amount.toLocaleString()}원
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            p.status === "completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                          }`}>
                            {p.status === "completed" ? "완료" : p.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-xs text-text-muted">
                          {p.period_start} ~ {p.period_end}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-8">결제 내역이 없습니다.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
