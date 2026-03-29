"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { CreditCard, Shield, CheckCircle, ArrowLeft, Loader2, BookOpen } from "lucide-react";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function ProgramPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 파라미터에서 프로그램 정보 가져오기
  const programName = searchParams.get("name") || "교육프로그램";
  const programId = searchParams.get("programId") || "";
  const programFee = Number(searchParams.get("fee")) || 300000;

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
        router.push("/mypage/programs/pay/success");
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
      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: programFee,
          paymentType: "program_fee",
          programId,
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

      const returnUrl = new URL("/mypage/programs/pay", window.location.origin);
      returnUrl.searchParams.set("name", programName);
      returnUrl.searchParams.set("programId", programId);
      returnUrl.searchParams.set("fee", String(programFee));

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: programFee },
        orderId: createData.orderId,
        orderName: `KECA ${programName}`,
        successUrl: returnUrl.toString(),
        failUrl: `${returnUrl.toString()}&error=payment_failed`,
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
        title="교육과정 수강료 결제"
        breadcrumb={[
          { label: "마이페이지", href: "/mypage" },
          { label: "교육프로그램", href: "/programs" },
          { label: "결제" },
        ]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-card">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={20} />
                <p className="text-sm opacity-90">{programName}</p>
              </div>
              <p className="text-3xl font-bold mt-1">{programFee.toLocaleString()}원</p>
              <p className="text-xs opacity-60 mt-1">교육과정 수강료</p>
            </div>

            <div className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-text mb-3">수강 안내</h3>
              {[
                "전문 강사진의 체계적 교육",
                "교육 수료증 발급",
                "교육 자료 제공",
                "수료 후 네트워킹 기회",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-text-sub">
                  <CheckCircle size={14} className="text-blue-500 shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> 처리 중...</>
                ) : (
                  <><CreditCard size={18} /> {programFee.toLocaleString()}원 결제하기</>
                )}
              </button>
              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-text-muted">
                <Shield size={12} />
                토스페이먼츠 안전결제
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/programs" className="inline-flex items-center gap-1 text-sm text-text-sub hover:text-primary transition-colors">
              <ArrowLeft size={14} /> 교육프로그램으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
