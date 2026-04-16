import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMarketingEmail } from "@/lib/email";

// GET: 전체 회원 목록 조회 (수신자 추가 모달용)
export async function GET() {
  const supabase = createAdminClient();

  // marketing_email_agreed 컬럼이 없을 수 있으므로 (016 마이그레이션 미적용 시) 두 가지 시도
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, role, is_instructor, marketing_email_agreed, marketing_kakao_agreed")
    .order("created_at", { ascending: false });

  if (error) {
    // marketing_email_agreed 컬럼이 없는 경우 fallback
    const { data: fallback } = await supabase
      .from("profiles")
      .select("id, name, email, phone, role, is_instructor")
      .order("created_at", { ascending: false });

    const members = (fallback || []).map((m) => ({
      ...m,
      marketing_email_agreed: true,
      marketing_kakao_agreed: true,
    }));
    return NextResponse.json({ members });
  }

  return NextResponse.json({ members: data || [] });
}

// POST: 수신자 조회 OR 이메일 발송
export async function POST(request: NextRequest) {
  const body = await request.json();

  // action=get_recipients: 선택된 회원 ID로 프로필 조회
  if (body.action === "get_recipients") {
    const ids: string[] = body.ids || [];
    if (ids.length === 0) {
      return NextResponse.json({ recipients: [] });
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, phone, role, is_instructor, marketing_email_agreed, marketing_kakao_agreed")
      .in("id", ids);

    if (error) {
      const { data: fallback } = await supabase
        .from("profiles")
        .select("id, name, email, phone, role, is_instructor")
        .in("id", ids);
      const recipients = (fallback || []).map((m) => ({
        ...m,
        marketing_email_agreed: true,
        marketing_kakao_agreed: true,
      }));
      return NextResponse.json({ recipients });
    }
    return NextResponse.json({ recipients: data || [] });
  }

  // 이메일 발송 로직
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

  const { recipientIds, subject, body: emailBody, templateId } = body as {
    recipientIds: string[];
    subject: string;
    body: string;
    templateId?: string;
  };

  if (!recipientIds?.length || !subject || !emailBody) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  // 수신자 프로필 조회
  const { data: recipients } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, marketing_email_agreed")
    .in("id", recipientIds)
    .eq("marketing_email_agreed", true);

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ error: "이메일 수신 동의 회원이 없습니다." }, { status: 400 });
  }

  // 캠페인 생성
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("marketing_campaigns")
    .insert({
      title: subject,
      channel: "email",
      status: "sending",
      subject,
      body: emailBody,
      template_id: templateId || null,
      total_recipients: recipients.length,
      created_by: user.id,
    })
    .select()
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "캠페인 생성 실패" }, { status: 500 });
  }

  // 발송 로그 생성
  const logs = recipients.map((r) => ({
    campaign_id: campaign.id,
    recipient_id: r.id,
    recipient_email: r.email,
    channel: "email",
  }));

  await supabaseAdmin.from("marketing_send_logs").insert(logs);

  // 이메일 발송 (배치)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let successCount = 0;
  let failCount = 0;

  for (const recipient of recipients) {
    // 변수 치환
    const personalizedBody = emailBody
      .replace(/\{\{name\}\}/g, recipient.name)
      .replace(/\{\{email\}\}/g, recipient.email);

    const unsubscribeToken = Buffer.from(recipient.id).toString("base64");
    const unsubscribeUrl = `${siteUrl}/api/marketing/unsubscribe?token=${unsubscribeToken}`;

    const result = await sendMarketingEmail(
      recipient.email,
      subject,
      personalizedBody,
      unsubscribeUrl
    );

    // 로그 업데이트
    const logStatus = result.success ? "sent" : "failed";
    await supabaseAdmin
      .from("marketing_send_logs")
      .update({
        status: logStatus,
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.success ? null : result.error,
      })
      .eq("campaign_id", campaign.id)
      .eq("recipient_id", recipient.id);

    if (result.success) successCount++;
    else failCount++;

    // Resend rate limit: 10/s — 150ms delay between sends
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  // 캠페인 상태 업데이트
  await supabaseAdmin
    .from("marketing_campaigns")
    .update({
      status: failCount === recipients.length ? "failed" : "sent",
      sent_at: new Date().toISOString(),
      success_count: successCount,
      fail_count: failCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  return NextResponse.json({
    campaignId: campaign.id,
    successCount,
    failCount,
    totalRecipients: recipients.length,
  });
}
