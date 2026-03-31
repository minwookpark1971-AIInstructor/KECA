-- applications 테이블에 standby(예비강사) 상태 추가
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check CHECK (
  status IN ('pending','deposit_pending','submitted','selected','standby','rejected','cancelled')
);
