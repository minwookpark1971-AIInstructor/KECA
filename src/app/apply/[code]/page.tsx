import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// /apply/{code} → apply_redirects 조회 후 target_url로 302 리다이렉트
export default async function ApplyRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // code 형식 사전 검증 (영숫자/-/_ 만)
  if (!code || !/^[A-Za-z0-9_-]{4,32}$/.test(code)) {
    notFound();
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("apply_redirects")
    .select("id, target_url")
    .eq("code", code)
    .single();

  if (!data?.target_url) {
    notFound();
  }

  // 클릭 카운트 비동기 증가 (응답 지연 방지)
  void supabase.rpc("increment_apply_click", { redirect_id: data.id });

  redirect(data.target_url);
}
