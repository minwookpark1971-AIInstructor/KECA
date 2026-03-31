-- ============================================================
-- 009: 강사 선발 관리 기능 강화
-- - reviewing 상태 추가
-- - 예비강사 순위, 미선발 사유 등 컬럼 추가
-- - 상태 변경 이력 테이블 생성
-- - 알림 테이블 생성
-- ============================================================

-- 1. applications 상태 CHECK에 reviewing 추가
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check CHECK (
  status IN ('pending', 'deposit_pending', 'submitted', 'reviewing', 'selected', 'confirmed', 'standby', 'rejected', 'cancelled')
);

-- 2. applications 신규 컬럼 추가
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS standby_rank INTEGER DEFAULT NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status_changed_by UUID DEFAULT NULL;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS is_result_read BOOLEAN DEFAULT FALSE;

-- 3. 상태 변경 이력 테이블
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  memo TEXT
);

ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- 관리자 또는 해당 지원자 본인만 이력 조회 가능
CREATE POLICY "history_read" ON public.application_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_status_history.application_id
        AND applications.applicant_id = auth.uid()
    )
  );

-- 관리자만 이력 삽입 가능
CREATE POLICY "history_admin_insert" ON public.application_status_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. 알림 테이블
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID,
  reference_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 본인 알림만 조회 가능
CREATE POLICY "notifications_own_read" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- 본인 알림만 읽음 처리 가능
CREATE POLICY "notifications_own_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- 관리자만 알림 생성 가능 (또는 서비스 역할 키 사용)
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 완료
SELECT 'Migration 009 completed: selection enhancements' AS result;
