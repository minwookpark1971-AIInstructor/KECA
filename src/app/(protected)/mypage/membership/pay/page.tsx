"use client";

import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { CreditCard, Shield, CheckCircle, ArrowLeft } from "lucide-react";

export default function PaymentPage() {
  const annualFee = 100000;

  const handlePayment = () => {
    alert("목업 모드: 토스페이먼츠 연동 후 실제 결제가 가능합니다.\n\n결제 플로우:\n1. 결제하기 클릭\n2. 토스페이먼츠 결제창 오픈\n3. 카드/계좌이체 선택\n4. 결제 완료 → 정회원 승격");
  };

  return (
    <>
      <SubpageHero
        title="협회비 납부"
        breadcrumb={[
          { label: "마이페이지", href: "/mypage" },
          { label: "협회비", href: "/mypage/membership" },
          { label: "결제" },
        ]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-lg">
          {/* 결제 카드 */}
          <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-card">
            {/* 상단 */}
            <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white">
              <p className="text-sm opacity-80">KECA 연간 협회비</p>
              <p className="text-3xl font-bold mt-1">{annualFee.toLocaleString()}원</p>
              <p className="text-xs opacity-60 mt-1">1년간 정회원 자격 유지</p>
            </div>

            {/* 혜택 */}
            <div className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-text mb-3">정회원 혜택</h3>
              {[
                "교육프로그램 회원 할인",
                "자료실 교육 자료 다운로드",
                "교육후기 작성 권한",
                "세미나/워크숍 우선 참가",
                "자격시험 응시료 할인",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-text-sub">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>

            {/* 결제 버튼 */}
            <div className="p-6 pt-0">
              <button
                onClick={handlePayment}
                className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors"
              >
                <CreditCard size={18} />
                {annualFee.toLocaleString()}원 결제하기
              </button>
              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-text-muted">
                <Shield size={12} />
                토스페이먼츠 안전결제
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/mypage/membership" className="inline-flex items-center gap-1 text-sm text-text-sub hover:text-primary transition-colors">
              <ArrowLeft size={14} /> 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
