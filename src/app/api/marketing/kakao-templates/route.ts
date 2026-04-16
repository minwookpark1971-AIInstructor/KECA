import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApprovedTemplatesFromSolapi } from "@/lib/kakao";

// GET: 솔라피 템플릿 동기화
export async function GET() {
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

  try {
    // 솔라피에서 승인된 템플릿 목록 조회
    const solapiTemplates = await getApprovedTemplatesFromSolapi();

    if (solapiTemplates.length === 0) {
      return NextResponse.json({
        synced: 0,
        message: "솔라피에 등록된 템플릿이 없거나 API 키가 설정되지 않았습니다.",
      });
    }

    // DB에 upsert (kakao_template_code 기준)
    let syncedCount = 0;
    for (const tpl of solapiTemplates) {
      // 솔라피 상태 → 내부 상태 매핑
      const statusMap: Record<string, string> = {
        APPROVED: "approved",
        REJECTED: "rejected",
        PENDING: "pending_review",
        READY: "pending_review",
        INSPECTING: "pending_review",
      };
      const kakaoStatus = statusMap[tpl.status] || "draft";

      // 기존 템플릿 확인
      const { data: existing } = await supabaseAdmin
        .from("marketing_templates")
        .select("id")
        .eq("kakao_template_code", tpl.templateId)
        .single();

      if (existing) {
        // 업데이트
        await supabaseAdmin
          .from("marketing_templates")
          .update({
            name: tpl.name,
            body: tpl.content,
            kakao_status: kakaoStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // 신규 생성
        await supabaseAdmin
          .from("marketing_templates")
          .insert({
            name: tpl.name,
            channel: "kakao",
            type: "alimtalk",
            body: tpl.content,
            kakao_template_code: tpl.templateId,
            kakao_status: kakaoStatus,
            is_active: kakaoStatus === "approved",
          });
      }
      syncedCount++;
    }

    return NextResponse.json({
      synced: syncedCount,
      message: `${syncedCount}개 템플릿이 동기화되었습니다.`,
    });
  } catch (err) {
    console.error("템플릿 동기화 실패:", err);
    return NextResponse.json(
      { error: "템플릿 동기화에 실패했습니다." },
      { status: 500 }
    );
  }
}
