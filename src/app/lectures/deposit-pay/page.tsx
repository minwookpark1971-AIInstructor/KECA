"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

export default function DepositPayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [error, setError] = useState<string | null>(null);
  const isConfirming = useRef(false);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const lectureId = searchParams.get("lectureId");

  useEffect(() => {
    if (paymentKey && orderId && amount && !isConfirming.current) {
      isConfirming.current = true;
      confirmPayment(paymentKey, orderId, Number(amount));
    }
  }, [paymentKey, orderId, amount]);

  async function confirmPayment(pk: string, oid: string, amt: number) {
    try {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey: pk, orderId: oid, amount: amt }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setError(data.error || "결제 승인에 실패했습니다.");
        setStatus("error");
      }
    } catch {
      setError("결제 처리 중 오류가 발생했습니다.");
      setStatus("error");
    }
  }

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-sub">결제를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">결제 처리 오류</h2>
          <p className="text-text-sub mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            {lectureId && (
              <Link
                href={`/lectures/${lectureId}`}
                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                공고로 돌아가기
              </Link>
            )}
            <Link
              href="/mypage/applications"
              className="px-6 py-2.5 border border-border-light text-text-sub rounded-lg text-sm hover:bg-surface transition-colors"
            >
              지원이력 확인
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">지원이 완료되었습니다!</h2>
        <p className="text-text-sub mb-2">예치금 결제가 완료되어 지원이 접수되었습니다.</p>
        <p className="text-sm text-text-sub mb-6">선발 결과는 카카오 알림톡 및 이메일로 안내드립니다.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/mypage/applications"
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            지원이력 확인
          </Link>
          <Link
            href="/lectures"
            className="px-6 py-2.5 border border-border-light text-text-sub rounded-lg text-sm hover:bg-surface transition-colors"
          >
            강의공고 목록
          </Link>
        </div>
      </div>
    </div>
  );
}
