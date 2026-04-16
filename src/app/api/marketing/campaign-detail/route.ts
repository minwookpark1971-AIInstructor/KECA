import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });

  const supabase = createAdminClient();

  const { data: campaign, error: campaignError } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError) {
    return NextResponse.json({ error: campaignError.message }, { status: 500 });
  }

  // recipient_id FK는 auth.users를 가리키므로, profiles는 별도 조회 후 매핑한다.
  const { data: logs, error: logsError } = await supabase
    .from("marketing_send_logs")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 500 });
  }

  const recipientIds = Array.from(
    new Set((logs || []).map((l) => l.recipient_id).filter(Boolean))
  );

  let profileMap = new Map<string, { name?: string; email?: string; phone?: string }>();
  if (recipientIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, phone")
      .in("id", recipientIds);
    profileMap = new Map(
      (profiles || []).map((p) => [
        p.id,
        { name: p.name, email: p.email, phone: p.phone },
      ])
    );
  }

  const logsWithRecipient = (logs || []).map((l) => ({
    ...l,
    recipient: profileMap.get(l.recipient_id) || {
      email: l.recipient_email || undefined,
      phone: l.recipient_phone || undefined,
    },
  }));

  return NextResponse.json({ campaign, logs: logsWithRecipient });
}
