-- 010: payments 테이블에 metadata JSONB 컬럼 추가
-- 보증금 결제 시 applicationId 등 추가 정보를 저장하기 위함
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

SELECT 'Migration 010 completed: payments metadata column' AS result;
