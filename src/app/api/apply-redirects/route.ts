import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// URL-safe 8자 식별자 (약 47비트 엔트로피 → 1억 건 생성해도 충돌 확률 희박)
function generateCode(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 8);
}

// POST /api/apply-redirects
// 알림톡 발송 직전에 호출되어 target_url → code 매핑을 DB에 저장한다.
export async function POST(request: NextRequest) {
  // 관리자 권한 검증 (kakao-templates/route.ts와 동일 패턴)
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let body: { target_url?: string; label?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const targetUrl = (body.target_url || "").trim();
  const label = (body.label || "").trim() || null;

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    return NextResponse.json(
      { error: "유효한 URL(http:// 또는 https://로 시작)을 입력해주세요." },
      { status: 400 }
    );
  }
  if (targetUrl.length > 2000) {
    return NextResponse.json({ error: "URL이 너무 깁니다 (최대 2000자)." }, { status: 400 });
  }

  // UNIQUE 충돌 시 재시도 (최대 5회)
  for (let i = 0; i < 5; i++) {
    const code = generateCode();
    const { data, error } = await admin
      .from("apply_redirects")
      .insert({
        code,
        target_url: targetUrl,
        label,
        created_by: user.id,
      })
      .select("code")
      .single();

    if (data && !error) {
      return NextResponse.json({ code: data.code });
    }
    // 중복 키 에러면 재시도, 아니면 500
    if (error && !(error.code === "23505" || /duplicate/i.test(error.message))) {
      console.error("[apply-redirects] insert 실패:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "code 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
    { status: 500 }
  );
}
