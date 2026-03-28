"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { CreditCard, Shield, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

const ANNUAL_FEE = 100000;
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 결제 성공 콜백 처리
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const isConfirming = useRef(false);

  useEffect(() => {
    if (paymentKey && orderId && amount && !isConfirming.current) {
      isConfirming.current = true;
      confirmPayment(paymentKey, orderId, Number(amount));
    }
  }, [paymentKey, orderId, amount]);

  const confirmPayment = async (pk: string, oid: string, amt: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey: pk, orderId: oid, amount: amt }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/mypage/membership/pay/success");
      } else {
        setError(data.error || "결제 승인에 실패했습니다.");
      }
    } catch {
      setError("결제 처리 중 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!CLIENT_KEY) {
      setError("결제 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. 서버에서 orderId 생성
      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: ANNUAL_FEE, paymentType: "annual_membership" }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error);
        setLoading(false);
        return;
      }

      // 2. 토스페이먼츠 SDK 로드 및 결제창 호출
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: createData.orderId });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: ANNUAL_FEE },
        orderId: createData.orderId,
        orderName: "KECA 연간 협회비",
        successUrl: `${window.location.origin}/mypage/membership/pay`,
        failUrl: `${window.location.origin}/mypage/membership/pay?error=payment_failed`,
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes("사용자가")) {
        // 사용자가 결제창을 닫은 경우
        setLoading(false);
        return;
      }
      setError("결제 요청에 실패했습니다.");
      setLoading(false);
    }
  };

  // 결제 확인 중 화면
  if (paymentKey && loading) {
    return (
      <>
        <SubpageHero title="결제 처리 중" breadcrumb={[{ label: "마이페이지", href: "/mypage" }, { label: "결제" }]} />
        <section className="py-20">
          <div className="container-custom max-w-lg text-center">
            <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-text-sub">결제를 확인하고 있습니다...</p>
          </div>
        </section>
      </>
    );
  }

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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          {/* 결제 카드 */}
          <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-card">
            {/* 상단 */}
            <div className="bg-gradient-to-r from-primary to-primary-light p-6 text-white">
              <p className="text-sm opacity-80">KECA 연간 협회비</p>
              <p className="text-3xl font-bold mt-1">{ANNUAL_FEE.toLocaleString()}원</p>
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
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> 처리 중...</>
                ) : (
                  <><CreditCard size={18} /> {ANNUAL_FEE.toLocaleString()}원 결제하기</>
                )}
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
