-- ============================================================
-- 020: 카카오 알림톡 버튼용 리다이렉트 매핑
-- ============================================================
-- 알림톡 "교육신청하기" 같은 버튼의 URL을 매 발송마다 다른 외부 URL(예: 구글폼)로
-- 연결하기 위한 중간 리다이렉트 테이블. 승인된 템플릿 URL은 자체 도메인
-- https://keca.vercel.app/apply/#{code} 로 고정하고, 실제 타겟 URL은 DB에서 조회한다.

CREATE TABLE IF NOT EXISTS public.apply_redirects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  target_url  TEXT NOT NULL,
  label       TEXT,
  click_count INTEGER DEFAULT 0 NOT NULL,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_apply_redirects_code ON public.apply_redirects(code);

COMMENT ON TABLE public.apply_redirects IS
  '알림톡 버튼용 자체 도메인 리다이렉트 매핑. /apply/{code} → target_url 302.';
COMMENT ON COLUMN public.apply_redirects.code IS 'URL-safe 8~12자 랜덤 식별자';
COMMENT ON COLUMN public.apply_redirects.target_url IS '실제 리다이렉트할 외부 URL (구글폼 등)';
COMMENT ON COLUMN public.apply_redirects.label IS '캠페인/발송 메모 (관리자 참조용)';

-- RLS: 리다이렉트 페이지는 anon으로도 조회되어야 하므로 SELECT는 공개.
-- 생성/수정/삭제는 Service Role(admin client)만 사용하므로 별도 정책 불필요.
ALTER TABLE public.apply_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "apply_redirects_select_public" ON public.apply_redirects;
CREATE POLICY "apply_redirects_select_public"
  ON public.apply_redirects FOR SELECT
  USING (true);

-- 원자적 클릭 카운트 증가용 RPC
CREATE OR REPLACE FUNCTION public.increment_apply_click(redirect_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.apply_redirects
     SET click_count = click_count + 1
   WHERE id = redirect_id;
$$;

-- RPC는 anon도 호출 가능 (리다이렉트 페이지에서 호출되므로)
GRANT EXECUTE ON FUNCTION public.increment_apply_click(UUID) TO anon, authenticated;
