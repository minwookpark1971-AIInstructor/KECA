import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: campaign } = await supabase
    .from("marketing_campaigns").select("*").eq("id", campaignId).single();

  const { data: logs } = await supabase
    .from("marketing_send_logs")
    .select("*, recipient:recipient_id(name, email, phone)")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ campaign, logs: logs || [] });
}
