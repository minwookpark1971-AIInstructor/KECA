import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 카카오 딜러사 Webhook — 발송 결과 수신
export async function POST(request: NextRequest) {
  // TODO: 딜러사 선정 후 인증 토큰/서명 검증 구현
  // const signature = request.headers.get("x-webhook-signature");
  // if (!verifySignature(signature)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const body = await request.json();
    const { msgId, status, recipientPhone, errorCode, errorMessage } = body as {
      msgId?: string;
      status?: string;
      recipientPhone?: string;
      errorCode?: string;
      errorMessage?: string;
    };

    if (!msgId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 상태 매핑: 딜러사 상태 → 내부 상태
    const statusMap: Record<string, string> = {
      success: "delivered",
      sent: "sent",
      failed: "failed",
      read: "opened",
    };

    const mappedStatus = statusMap[status] || "sent";

    // 발송 로그 업데이트
    const updateData: Record<string, unknown> = {
      status: mappedStatus,
    };

    if (mappedStatus === "sent" || mappedStatus === "delivered") {
      updateData.sent_at = new Date().toISOString();
    }
    if (mappedStatus === "opened") {
      updateData.opened_at = new Date().toISOString();
    }
    if (mappedStatus === "failed") {
      updateData.error_message = errorMessage || errorCode || "발송 실패";
    }

    // recipient_phone으로 매칭 (딜러사 응답에 포함)
    if (recipientPhone) {
      await supabase
        .from("marketing_send_logs")
        .update(updateData)
        .eq("recipient_phone", recipientPhone)
        .eq("status", "pending");
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
