-- 웹훅이 recipient_phone + status='pending' 조합으로 marketing_send_logs를 업데이트할 때
-- full scan을 방지하기 위한 부분 인덱스. pending 상태 레코드만 인덱싱하여 크기 최소화.

CREATE INDEX IF NOT EXISTS idx_send_logs_phone_pending
  ON public.marketing_send_logs (recipient_phone)
  WHERE status = 'pending';
