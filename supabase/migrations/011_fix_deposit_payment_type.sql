-- 011: payments_payment_type_check에 deposit 추가
-- 보증금 결제가 CHECK 제약조건에 의해 거부되는 버그 수정
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_type_check
  CHECK (payment_type IN ('annual_membership', 'certification_fee', 'program_fee', 'deposit'));

SELECT 'Migration 011 completed: deposit added to payment_type check' AS result;
