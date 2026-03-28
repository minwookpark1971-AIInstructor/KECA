import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { SubpageHero } from "@/components/layout/SubpageHero";

export default function PaymentSuccessPage() {
  return (
    <>
      <SubpageHero
        title="결제 완료"
        breadcrumb={[
          { label: "마이페이지", href: "/mypage" },
          { label: "결제 완료" },
        ]}
      />
      <section className="py-20">
        <div className="container-custom max-w-lg text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-text mb-2">결제가 완료되었습니다</h2>
          <p className="text-text-sub mb-2">KECA 정회원으로 등록되었습니다.</p>
          <p className="text-sm text-text-muted mb-8">1년간 모든 정회원 혜택을 이용하실 수 있습니다.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/mypage"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
            >
              마이페이지로 이동 <ArrowRight size={14} />
            </Link>
            <Link
              href="/mypage/membership"
              className="inline-flex items-center justify-center gap-2 border border-border-light text-text-sub px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-surface transition-colors"
            >
              결제 내역 확인
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
