import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json();
    if (!applicationId) {
      return NextResponse.json({ error: "applicationId 필수" }, { status: 400 });
    }

    const supabase = await createClient();

    // 관리자 권한 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "관리자 전용" }, { status: 403 });
    }

    // 지원 정보 조회
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, deposit_payment_id, status")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: "지원 정보 없음" }, { status: 404 });
    }

    if (!application.deposit_payment_id) {
      return NextResponse.json({ error: "환불할 예치금 결제 없음" }, { status: 400 });
    }

    // 결제 정보 조회
    const { data: payment } = await supabase
      .from("payments")
      .select("toss_payment_key, amount, status")
      .eq("id", application.deposit_payment_id)
      .single();

    if (!payment || payment.status !== "completed") {
      return NextResponse.json({ error: "환불 가능한 결제 없음" }, { status: 400 });
    }

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "결제 설정 오류" }, { status: 500 });
    }

    // Toss 환불 요청
    const refundRes = await fetch(
      `https://api.tosspayments.com/v1/payments/${payment.toss_payment_key}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancelReason: "강사 미선발 예치금 환불" }),
      }
    );

    if (!refundRes.ok) {
      const errData = await refundRes.json();
      return NextResponse.json(
        { error: errData.message || "환불 실패" },
        { status: 400 }
      );
    }

    // DB 업데이트
    await supabase
      .from("payments")
      .update({ status: "refunded" })
      .eq("id", application.deposit_payment_id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
