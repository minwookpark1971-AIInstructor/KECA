import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount } = await request.json();

    // 토스페이먼츠 결제 승인 요청
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "결제 설정 오류" }, { status: 500 });
    }

    const confirmRes = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      }
    );

    const confirmData = await confirmRes.json();

    if (!confirmRes.ok) {
      return NextResponse.json(
        { error: confirmData.message || "결제 승인 실패" },
        { status: 400 }
      );
    }

    // DB 업데이트: 결제 완료
    const supabase = await createClient();
    const now = new Date().toISOString();
    const oneYearLater = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toISOString();

    // payments 테이블 업데이트
    const { error: payError } = await supabase
      .from("payments")
      .update({
        toss_payment_key: paymentKey,
        toss_method: confirmData.method,
        status: "completed",
        paid_at: now,
        period_start: now,
        period_end: oneYearLater,
        receipt_url: confirmData.receipt?.url || null,
      })
      .eq("toss_order_id", orderId);

    if (payError) {
      console.error("Payment DB update failed:", payError);
    }

    // 결제 타입별 후처리
    const { data: paymentData } = await supabase
      .from("payments")
      .select("user_id, payment_type")
      .eq("toss_order_id", orderId)
      .single();

    if (paymentData) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, name")
        .eq("id", paymentData.user_id)
        .single();

      if (paymentData.payment_type === "annual_membership") {
        // 회원 등급 자동 승격: pending/approved → member
        await supabase
          .from("profiles")
          .update({
            role: "member",
            membership_paid_at: now,
            membership_expires_at: oneYearLater,
          })
          .eq("id", paymentData.user_id)
          .in("role", ["pending", "approved"]);
      }

      if (paymentData.payment_type === "deposit") {
        // metadata에서 applicationId 조회
        const { data: paymentRow } = await supabase
          .from("payments")
          .select("id, metadata")
          .eq("toss_order_id", orderId)
          .single();
        const meta = paymentRow?.metadata as { applicationId?: string } | null;
        const applicationId = meta?.applicationId;
        if (paymentRow && applicationId) {
          // 강사확정(selected) 후 보증금 결제 → 최종확정(confirmed)
          await supabase
            .from("applications")
            .update({
              status: "confirmed",
              deposit_payment_id: paymentRow.id,
              updated_at: now,
            })
            .eq("id", applicationId)
            .eq("status", "selected");
        }
      }

      // 결제 완료 이메일 발송 (모든 타입 공통)
      if (profile) {
        sendPaymentConfirmation(
          profile.email,
          profile.name,
          amount,
          paymentData.payment_type === "annual_membership"
            ? oneYearLater.slice(0, 10)
            : ""
        );
      }
    }

    return NextResponse.json({ success: true, receipt: confirmData.receipt?.url });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
