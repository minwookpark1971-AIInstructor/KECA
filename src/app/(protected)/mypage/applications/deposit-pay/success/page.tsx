import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { CheckCircle } from "lucide-react";

export const metadata = { title: "보증금 결제 완료" };

export default function DepositPaySuccessPage() {
  return (
    <>
      <SubpageHero
        title="결제 완료"
        breadcrumb={[
          { label: "마이페이지", href: "/mypage" },
          { label: "지원이력", href: "/mypage/applications" },
          { label: "결제 완료" },
        ]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-lg text-center">
          <div className="bg-white border border-border-light rounded-2xl p-8 shadow-card">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text mb-2">보증금 결제가 완료되었습니다!</h2>
            <p className="text-sm text-text-sub mb-6">
              강사로 최종 확정되었습니다.<br />
              담당자가 곧 연락드리겠습니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/mypage/applications"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                지원이력 보기
              </Link>
              <Link
                href="/mypage"
                className="flex-1 inline-flex items-center justify-center gap-2 border border-border-light text-text-sub px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-surface transition-colors"
              >
                마이페이지
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
