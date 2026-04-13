import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// 솔라피 Webhook 서명 검증
function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.SOLAPI_API_SECRET;
  if (!secret || !signature) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expected = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// 솔라피 Webhook — 발송 결과 수신
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-solapi-signature");

  // 서명 검증 (환경변수 없으면 스킵 — 개발 환경)
  if (process.env.SOLAPI_API_SECRET && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);

    // 솔라피 Webhook 형식
    const { messageId, statusCode, to } = body as {
      messageId?: string;
      statusCode?: string;
      to?: string;
    };

    if (!messageId && !to) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 솔라피 상태 코드 → 내부 상태 매핑
    const statusMap: Record<string, string> = {
      "2000": "delivered",   // 발송 성공
      "3000": "delivered",   // 수신 완료
      "4000": "failed",      // 발송 실패
      "4100": "failed",      // 차단
      "success": "delivered",
      "sent": "sent",
      "failed": "failed",
      "read": "opened",
    };

    const mappedStatus = statusMap[statusCode || ""] || "sent";

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
      updateData.error_message = body.reason || body.errorMessage || statusCode || "발송 실패";
    }

    // recipient_phone으로 최근 pending 로그 매칭
    if (to) {
      const normalizedPhone = to.replace(/[^0-9]/g, "");
      await supabase
        .from("marketing_send_logs")
        .update(updateData)
        .eq("recipient_phone", normalizedPhone)
        .eq("status", "pending");
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
