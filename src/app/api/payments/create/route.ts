import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { amount, paymentType, programId, applicationId } = await request.json();
    const orderId = `KECA_${user.id.slice(0, 8)}_${Date.now()}`;

    // payments 테이블에 pending 레코드 생성
    const insertData: Record<string, unknown> = {
      user_id: user.id,
      payment_type: paymentType || "annual_membership",
      amount,
      currency: "KRW",
      toss_order_id: orderId,
      status: "pending",
    };

    // program_fee인 경우 metadata에 programId 저장
    if (paymentType === "program_fee" && programId) {
      insertData.metadata = { programId };
    }

    // deposit인 경우 metadata에 applicationId 저장
    if (paymentType === "deposit" && applicationId) {
      insertData.metadata = { applicationId };
    }

    const { error } = await supabase.from("payments").insert(insertData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orderId });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
