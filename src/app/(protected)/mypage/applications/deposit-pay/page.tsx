"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { CreditCard, Shield, Loader2, ArrowLeft } from "lucide-react";

const DEPOSIT_AMOUNT = 30000;
const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function DepositPayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applicationId = searchParams.get("applicationId");
  const lectureTitle = searchParams.get("lectureTitle") ?? "강의";

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
        router.push("/mypage/applications/deposit-pay/success");
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
      setError("결제 설정이 완료되지 않았습니다.");
      return;
    }
    if (!applicationId) {
      setError("지원 정보를 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: DEPOSIT_AMOUNT,
          paymentType: "deposit",
          applicationId,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error);
        setLoading(false);
        return;
      }

      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: createData.orderId });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: DEPOSIT_AMOUNT },
        orderId: createData.orderId,
        orderName: `[보증금] ${decodeURIComponent(lectureTitle)}`,
        successUrl: `${window.location.origin}/mypage/applications/deposit-pay?applicationId=${applicationId}&lectureTitle=${lectureTitle}`,
        failUrl: `${window.location.origin}/mypage/applications?error=payment_failed`,
        card: {
          keyin: {
            selectableCardTypes: ["PERSONAL", "CORPORATE"],
          },
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes("사용자가")) {
        setLoading(false);
        return;
      }
      setError("결제 요청에 실패했습니다.");
      setLoading(false);
    }
  };

  if (paymentKey && loading) {
    return (
      <>
        <SubpageHero title="결제 처리 중" breadcrumb={[{ label: "마이페이지", href: "/mypage" }, { label: "보증금 결제" }]} />
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
        title="보증금 결제"
        breadcrumb={[
          { label: "마이페이지", href: "/mypage" },
          { label: "지원이력", href: "/mypage/applications" },
          { label: "보증금 결제" },
        ]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-card">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
              <p className="text-sm opacity-80">강사 보증금</p>
              <p className="text-3xl font-bold mt-1">{DEPOSIT_AMOUNT.toLocaleString()}원</p>
              <p className="text-xs opacity-60 mt-1">{decodeURIComponent(lectureTitle)}</p>
            </div>

            <div className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-text mb-3">보증금 안내</h3>
              <div className="space-y-2 text-sm text-text-sub">
                <p>- 강사확정 후 보증금 결제를 완료하시면 최종 확정됩니다.</p>
                <p>- 보증금은 강의 완료 후 강사료에서 차감됩니다.</p>
                <p>- 강의 취소 시 환불 규정에 따라 처리됩니다.</p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={handlePayment}
                disabled={loading || !applicationId}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> 처리 중...</>
                ) : (
                  <><CreditCard size={18} /> {DEPOSIT_AMOUNT.toLocaleString()}원 결제하기</>
                )}
              </button>
              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-text-muted">
                <Shield size={12} />
                토스페이먼츠 안전결제
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/mypage/applications" className="inline-flex items-center gap-1 text-sm text-text-sub hover:text-primary transition-colors">
              <ArrowLeft size={14} /> 지원이력으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
