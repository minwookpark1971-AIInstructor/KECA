import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // 관리자 권한 확인
  const supabaseUser = await createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await request.json();
  const { recipientIds, messageType, message } = body as {
    recipientIds: string[];
    messageType: "alimtalk" | "brand_message";
    message: string;
  };

  if (!recipientIds?.length || !message) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  // 수신자 조회
  const { data: recipients } = await supabaseAdmin
    .from("profiles")
    .select("id, name, phone, marketing_kakao_agreed")
    .in("id", recipientIds)
    .not("phone", "is", null);

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ error: "연락처가 있는 수신자가 없습니다." }, { status: 400 });
  }

  // 브랜드 메시지는 동의 필터 적용
  const targetRecipients = messageType === "brand_message"
    ? recipients.filter((r) => r.marketing_kakao_agreed)
    : recipients;

  if (targetRecipients.length === 0) {
    return NextResponse.json({ error: "발송 가능한 수신자가 없습니다." }, { status: 400 });
  }

  // 브랜드 메시지 야간 발송 제한 (21:00~08:00 KST)
  if (messageType === "brand_message") {
    const kstHour = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul", hour: "numeric", hour12: false });
    const hour = parseInt(kstHour);
    if (hour >= 21 || hour < 8) {
      return NextResponse.json({
        error: "브랜드 메시지는 야간(21:00~08:00)에 발송할 수 없습니다.",
      }, { status: 400 });
    }
  }

  const channel = messageType === "alimtalk" ? "kakao_alimtalk" : "kakao_brand_message";

  // 캠페인 생성
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("marketing_campaigns")
    .insert({
      title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
      channel,
      status: "sending",
      body: message,
      total_recipients: targetRecipients.length,
      created_by: user.id,
    })
    .select()
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "캠페인 생성 실패" }, { status: 500 });
  }

  // 발송 로그 생성
  const logs = targetRecipients.map((r) => ({
    campaign_id: campaign.id,
    recipient_id: r.id,
    recipient_phone: r.phone,
    channel,
  }));

  await supabaseAdmin.from("marketing_send_logs").insert(logs);

  // TODO: 실제 딜러사 API 호출
  // 현재는 딜러사 연동 전이므로 로그만 기록하고 상태를 pending으로 유지
  // 딜러사 선정 후 아래 주석 해제 및 구현 필요
  //
  // for (const recipient of targetRecipients) {
  //   const personalizedMessage = message
  //     .replace(/#{이름}/g, recipient.name)
  //     .replace(/#{연락처}/g, recipient.phone || "");
  //
  //   const result = messageType === "alimtalk"
  //     ? await sendAlimtalk(recipient.phone!, templateCode, { name: recipient.name })
  //     : await sendBrandMessage(recipient.phone!, personalizedMessage);
  //
  //   await supabaseAdmin.from("marketing_send_logs").update({
  //     status: result.success ? "sent" : "failed",
  //     sent_at: result.success ? new Date().toISOString() : null,
  //     error_message: result.error || null,
  //   }).eq("campaign_id", campaign.id).eq("recipient_id", recipient.id);
  // }

  // 딜러사 미연동 상태에서는 캠페인을 draft로 저장
  await supabaseAdmin
    .from("marketing_campaigns")
    .update({
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  return NextResponse.json({
    campaignId: campaign.id,
    successCount: 0,
    totalRecipients: targetRecipients.length,
    message: "카카오톡 딜러사 연동이 필요합니다. 캠페인이 초안으로 저장되었습니다.",
  });
}
