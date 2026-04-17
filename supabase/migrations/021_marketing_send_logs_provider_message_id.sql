-- marketing_send_logs 웹훅 매칭 정확도 개선
-- 기존엔 recipient_phone + status='pending'으로 매칭했으나,
-- (1) 발송 직후 status가 즉시 'sent'로 바뀌어 매칭 실패
-- (2) 동일 번호 중복 캠페인 오염 가능
-- → Solapi의 provider messageId를 저장하여 정확 매칭 가능하게 함.

-- 1. Solapi 메시지 ID 컬럼 추가 (nullable — 구 레코드 호환)
ALTER TABLE public.marketing_send_logs
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT;

-- 2. 웹훅 매칭용 인덱스 (고유하지 않음 — 동일 messageId 재시도 가능성 대비)
CREATE INDEX IF NOT EXISTS idx_send_logs_provider_msg_id
  ON public.marketing_send_logs (provider_message_id)
  WHERE provider_message_id IS NOT NULL;
