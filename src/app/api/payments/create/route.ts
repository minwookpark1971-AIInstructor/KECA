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

    // metadata 저장 (010 마이그레이션 적용 후 동작)
    const metadataPayload: Record<string, string> = {};
    if (paymentType === "program_fee" && programId) {
      metadataPayload.programId = programId;
    }
    if (paymentType === "deposit" && applicationId) {
      metadataPayload.applicationId = applicationId;
    }
    if (Object.keys(metadataPayload).length > 0) {
      insertData.metadata = metadataPayload;
    }

    // 먼저 metadata 포함하여 시도
    let { error } = await supabase.from("payments").insert(insertData);

    // metadata 컬럼이 없으면 metadata 제외하고 재시도
    if (error && insertData.metadata) {
      const { metadata: _, ...withoutMetadata } = insertData;
      const retry = await supabase.from("payments").insert(withoutMetadata);
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orderId, applicationId });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
