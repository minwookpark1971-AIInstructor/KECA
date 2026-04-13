-- ============================================================
-- 018: 마케팅 모듈 기능 개선 — 템플릿/그룹/캠페인 확장
-- ============================================================

-- marketing_templates 확장 (카카오 알림톡/브랜드 메시지 구분)
ALTER TABLE public.marketing_templates
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS kakao_template_code TEXT,
  ADD COLUMN IF NOT EXISTS kakao_status TEXT DEFAULT 'draft';

-- 기존 데이터 backfill
UPDATE public.marketing_templates SET type = 'email' WHERE channel = 'email' AND (type IS NULL OR type = 'email');
UPDATE public.marketing_templates SET type = 'brand_message' WHERE channel = 'kakao' AND (type IS NULL OR type = 'email');

-- marketing_groups 확장 (동적/정적 그룹)
ALTER TABLE public.marketing_groups
  ADD COLUMN IF NOT EXISTS group_type TEXT DEFAULT 'static',
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- marketing_campaigns 확장 (소프트 삭제 + 카카오 버튼/이미지)
ALTER TABLE public.marketing_campaigns
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kakao_buttons JSONB,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_campaigns_deleted ON public.marketing_campaigns(deleted_at);
