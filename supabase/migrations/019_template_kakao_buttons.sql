-- ============================================================
-- 019: 카카오 알림톡 템플릿 버튼 메타데이터 저장
-- ============================================================
-- 솔라피에 등록된 템플릿의 buttons (buttonName, buttonType, linkMo, linkPc 등)
-- 배열을 JSON으로 그대로 저장하여, 발송 UI에서 버튼별 URL 편집을 지원한다.

ALTER TABLE public.marketing_templates
  ADD COLUMN IF NOT EXISTS kakao_buttons JSONB;

COMMENT ON COLUMN public.marketing_templates.kakao_buttons IS
  '솔라피 카카오 알림톡 템플릿의 buttons 메타데이터 (buttonName/buttonType/linkMo/linkPc 등). 발송 시 관리자가 URL을 override 가능.';
