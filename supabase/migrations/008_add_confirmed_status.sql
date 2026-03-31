-- applications 테이블에 confirmed(최종확정) 상태 추가
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check CHECK (
  status IN ('pending','deposit_pending','submitted','selected','confirmed','standby','rejected','cancelled')
);
