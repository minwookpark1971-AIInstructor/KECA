import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendAlimtalkViaSolapi,
  sendBrandMessageViaSolapi,
  normalizePhoneNumber,
} from "@/lib/kakao";

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
  const { recipientIds, messageType, message, buttons, imageUrl, templateCode, testPhone } = body as {
    recipientIds: string[];
    messageType: "alimtalk" | "brand_message";
    message: string;
    buttons?: Array<{ name: string; url: string; type: string }>;
    imageUrl?: string;
    templateCode?: string;
    testPhone?: string;
  };

  const isTestMode = !!testPhone;

  if (!isTestMode && (!recipientIds?.length || !message)) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }
  if (isTestMode && !message) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  // 버튼 검증
  if (buttons && buttons.length > 5) {
    return NextResponse.json({ error: "링크 버튼은 최대 5개까지 가능합니다." }, { status: 400 });
  }
  if (buttons) {
    for (const btn of buttons) {
      if (!btn.name || !btn.url) {
        return NextResponse.json({ error: "링크 버튼의 이름과 URL을 모두 입력해주세요." }, { status: 400 });
      }
    }
  }

  // 테스트 발송 모드: 1건만 즉시 발송
  if (isTestMode) {
    const solapiButtons = buttons?.map((btn) => ({
      buttonName: btn.name,
      buttonType: "WL" as const,
      linkMo: btn.url,
      linkPc: btn.url,
    }));

    let result: { success: boolean; messageId?: string; error?: string };

    if (messageType === "alimtalk") {
      result = await sendAlimtalkViaSolapi(
        testPhone,
        templateCode || "DEFAULT",
        { "이름": "테스트" },
        solapiButtons
      );
    } else {
      result = await sendBrandMessageViaSolapi(
        testPhone,
        message.replace(/#{이름}/g, "테스트").replace(/#{연락처}/g, testPhone),
        { imageUrl: imageUrl || undefined, buttons: solapiButtons }
      );
    }

    return NextResponse.json({
      success: result.success,
      error: result.error,
      testPhone,
    });
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
      kakao_buttons: buttons || null,
      image_url: imageUrl || null,
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

  // 솔라피 버튼 형식 변환
  const solapiButtons = buttons?.map((btn) => ({
    buttonName: btn.name,
    buttonType: "WL" as const,
    linkMo: btn.url,
    linkPc: btn.url,
  }));

  // 실제 발송 (솔라피 SDK)
  let successCount = 0;
  let failCount = 0;
  let firstError = "";

  for (const recipient of targetRecipients) {
    // 변수 치환
    const personalizedMessage = message
      .replace(/#{이름}/g, recipient.name)
      .replace(/#{연락처}/g, recipient.phone || "");

    let result: { success: boolean; messageId?: string; error?: string };

    if (messageType === "alimtalk") {
      // 알림톡: 템플릿 코드 필수
      const tplCode = templateCode || "DEFAULT";
      result = await sendAlimtalkViaSolapi(
        recipient.phone!,
        tplCode,
        { "이름": recipient.name },
        solapiButtons
      );
    } else {
      // 브랜드 메시지: 자유 형식
      result = await sendBrandMessageViaSolapi(
        recipient.phone!,
        personalizedMessage,
        {
          imageUrl: imageUrl || undefined,
          buttons: solapiButtons,
        }
      );
    }

    // 발송 로그 업데이트
    await supabaseAdmin
      .from("marketing_send_logs")
      .update({
        status: result.success ? "sent" : "failed",
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.success ? null : result.error,
      })
      .eq("campaign_id", campaign.id)
      .eq("recipient_id", recipient.id);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
      if (!firstError && result.error) firstError = result.error;
      console.error(`[send-kakao] 발송 실패 (${recipient.name} / ${recipient.phone}):`, result.error);
    }

    // Rate limit: 100ms 간격
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // 캠페인 상태 업데이트
  await supabaseAdmin
    .from("marketing_campaigns")
    .update({
      status: failCount === targetRecipients.length ? "failed" : "sent",
      sent_at: new Date().toISOString(),
      success_count: successCount,
      fail_count: failCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  // 전체 실패 시 에러 정보 포함
  if (successCount === 0 && failCount > 0) {
    return NextResponse.json({
      error: `전체 발송 실패: ${firstError || "알 수 없는 오류"}`,
      campaignId: campaign.id,
      successCount,
      failCount,
      totalRecipients: targetRecipients.length,
    }, { status: 500 });
  }

  return NextResponse.json({
    campaignId: campaign.id,
    successCount,
    failCount,
    totalRecipients: targetRecipients.length,
  });
}
