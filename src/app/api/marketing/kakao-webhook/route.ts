import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

function maskPhone(phone: string | undefined | null): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 8) return digits.replace(/./g, "*");
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}

function verifySignature(rawBody: string, signature: string | null): { ok: boolean; reason?: string } {
  const secret = process.env.SOLAPI_API_SECRET;
  if (!secret) return { ok: false, reason: "missing_secret" };
  if (!signature) return { ok: false, reason: "missing_signature" };

  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const expected = hmac.digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length) {
      return { ok: false, reason: `length_mismatch(sig=${sigBuf.length},exp=${expBuf.length})` };
    }
    return { ok: crypto.timingSafeEqual(sigBuf, expBuf) };
  } catch (err) {
    return { ok: false, reason: `exception:${(err as Error).message}` };
  }
}

// Solapi statusCode → 내부 상태 매핑
// 2xxx, 3xxx: 성공/전달 완료 (단 3108 등 알림톡 도달 상태도 포함)
// 4xxx: 실패
// 1xxx: 접수 중
const explicitStatusMap: Record<string, string> = {
  "1000": "sent",
  "2000": "delivered",
  "3000": "delivered",
  "3108": "delivered",
  "4000": "failed",
  "4100": "failed",
  success: "delivered",
  DELIVERED: "delivered",
  DELIVERED_COMPLETED: "delivered",
  sent: "sent",
  SENT: "sent",
  failed: "failed",
  FAILED: "failed",
  read: "opened",
  READ: "opened",
};

function mapStatus(raw: string | undefined): string {
  if (!raw) return "sent";
  if (explicitStatusMap[raw]) return explicitStatusMap[raw];
  // 첫 자리 기반 fallback 매핑
  const first = raw.charAt(0);
  if (first === "2" || first === "3") return "delivered";
  if (first === "4" || first === "5") return "failed";
  if (first === "1") return "sent";
  return "sent";
}

type SolapiEvent = {
  messageId?: string;
  statusCode?: string;
  status?: string;
  eventType?: string;
  to?: string;
  reason?: string;
  errorMessage?: string;
  type?: string;
  from?: string;
  groupId?: string;
};

type MatchResult = { matched: boolean; via?: "messageId" | "phone"; error?: string };

async function applyEvent(
  supabase: ReturnType<typeof createAdminClient>,
  event: SolapiEvent
): Promise<MatchResult> {
  const raw = event.statusCode || event.status || event.eventType || "";
  const mappedStatus = mapStatus(raw);

  const updateData: Record<string, unknown> = { status: mappedStatus };
  if (mappedStatus === "sent" || mappedStatus === "delivered") {
    updateData.sent_at = new Date().toISOString();
  }
  if (mappedStatus === "opened") {
    updateData.opened_at = new Date().toISOString();
  }
  if (mappedStatus === "failed") {
    updateData.error_message = event.reason || event.errorMessage || raw || "발송 실패";
  }

  // 1순위: provider_message_id로 정확 매칭
  if (event.messageId) {
    try {
      const { data, error } = await supabase
        .from("marketing_send_logs")
        .update(updateData)
        .eq("provider_message_id", event.messageId)
        .select("id");
      if (error) return { matched: false, error: `msgid:${error.message}` };
      if ((data?.length ?? 0) > 0) return { matched: true, via: "messageId" };
    } catch (err) {
      return { matched: false, error: `msgid_exc:${(err as Error).message}` };
    }
  }

  // 2순위: 정규화된 전화번호로 fallback 매칭 (status 무관하게 가장 최근 pending/sent만)
  const normalizedPhone = (event.to || "").replace(/[^0-9]/g, "");
  if (!normalizedPhone) {
    return { matched: false, error: "no_phone_no_msgid" };
  }

  try {
    const { data, error } = await supabase
      .from("marketing_send_logs")
      .update(updateData)
      .eq("recipient_phone", normalizedPhone)
      .in("status", ["pending", "sent"])
      .select("id");
    if (error) return { matched: false, error: `phone:${error.message}` };
    return { matched: (data?.length ?? 0) > 0, via: "phone" };
  } catch (err) {
    return { matched: false, error: `phone_exc:${(err as Error).message}` };
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-solapi-signature");
  const verifyEnabled = process.env.KAKAO_WEBHOOK_VERIFY_SIGNATURE === "true";

  const headersSummary: Record<string, string> = {};
  for (const [k, v] of request.headers.entries()) {
    if (k.startsWith("x-solapi") || k === "date" || k === "content-type" || k === "user-agent") {
      headersSummary[k] = v;
    }
  }

  const verifyResult = verifySignature(rawBody, signature);
  if (verifyEnabled && !verifyResult.ok) {
    console.warn("[kakao-webhook] signature verification failed (enforced)", {
      reason: verifyResult.reason,
      headers: headersSummary,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: unknown = null;
  let parseError: string | null = null;
  try {
    parsed = JSON.parse(rawBody);
  } catch (err) {
    parseError = (err as Error).message;
  }

  const events: SolapiEvent[] = Array.isArray(parsed)
    ? (parsed as SolapiEvent[])
    : parsed && typeof parsed === "object"
      ? [parsed as SolapiEvent]
      : [];

  console.log("[kakao-webhook] received", {
    verifyEnabled,
    verifyOk: verifyResult.ok,
    verifyReason: verifyResult.reason,
    headers: headersSummary,
    parseError,
    rawBodyPreview: rawBody.slice(0, 1000),
    eventCount: events.length,
    samples: events.slice(0, 3).map((e) => ({
      messageId: e.messageId,
      to: maskPhone(e.to),
      statusCode: e.statusCode,
      type: e.type,
    })),
  });

  if (events.length === 0) {
    return NextResponse.json({ received: true, note: "no_events" });
  }

  const supabase = createAdminClient();
  const results = await Promise.allSettled(events.map((e) => applyEvent(supabase, e)));

  const summary = results.reduce(
    (acc, r, i) => {
      if (r.status === "fulfilled") {
        if (r.value.matched) {
          acc.matched += 1;
          if (r.value.via === "messageId") acc.viaMessageId += 1;
          else if (r.value.via === "phone") acc.viaPhone += 1;
        } else {
          acc.unmatched += 1;
        }
        if (r.value.error) {
          acc.errors.push(`#${i}:${r.value.error}`);
        }
      } else {
        acc.errors.push(`#${i}:${r.reason}`);
      }
      return acc;
    },
    { matched: 0, unmatched: 0, viaMessageId: 0, viaPhone: 0, errors: [] as string[] }
  );

  if (summary.errors.length > 0 || summary.unmatched > 0) {
    console.warn("[kakao-webhook] processing summary", summary);
  }

  return NextResponse.json({ received: true, ...summary });
}
