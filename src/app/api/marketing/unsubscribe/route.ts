import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(renderPage("잘못된 요청입니다.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const userId = Buffer.from(token, "base64").toString("utf-8");
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        marketing_email_agreed: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    return new NextResponse(renderPage("이메일 수신 거부가 완료되었습니다.", true), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse(renderPage("처리 중 오류가 발생했습니다.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

function renderPage(message: string, success: boolean) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>수신 거부 - KECA</title>
  <style>
    body { font-family: 'Pretendard', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fafafa; }
    .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center; max-width: 400px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 18px; color: #1a1a1a; margin-bottom: 8px; }
    p { font-size: 14px; color: #888; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <h1>${message}</h1>
    <p>KECA 한국교육컨설팅협회</p>
  </div>
</body>
</html>`;
}
