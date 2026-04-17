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

const statusMap: Record<string, string> = {
  "2000": "delivered",
  "3000": "delivered",
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

type SolapiEvent = {
  messageId?: string;
  statusCode?: string;
  status?: string;
  eventType?: string;
  to?: string;
  reason?: string;
  errorMessage?: string;
};

async function applyEvent(
  supabase: ReturnType<typeof createAdminClient>,
  event: SolapiEvent
): Promise<{ matched?: boolean; error?: string }> {
  const raw = event.statusCode || event.status || event.eventType || "";
  const mappedStatus = statusMap[raw] || "sent";

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

  const normalizedPhone = (event.to || "").replace(/[^0-9]/g, "");
  if (!normalizedPhone) {
    return { matched: false, error: "no_phone" };
  }

  try {
    const { data, error } = await supabase
      .from("marketing_send_logs")
      .update(updateData)
      .eq("recipient_phone", normalizedPhone)
      .eq("status", "pending")
      .select("id");
    if (error) return { matched: false, error: error.message };
    return { matched: (data?.length ?? 0) > 0 };
  } catch (err) {
    return { matched: false, error: (err as Error).message };
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
      status: e.status,
      eventType: e.eventType,
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
        if (r.value.matched) acc.matched += 1;
        if (r.value.error) {
          acc.errors.push(`#${i}:${r.value.error}`);
        } else if (!r.value.matched) {
          acc.unmatched += 1;
        }
      } else {
        acc.errors.push(`#${i}:${r.reason}`);
      }
      return acc;
    },
    { matched: 0, unmatched: 0, errors: [] as string[] }
  );

  if (summary.errors.length > 0 || summary.unmatched > 0) {
    console.warn("[kakao-webhook] processing summary", summary);
  }

  return NextResponse.json({ received: true, ...summary });
}
