-- ============================================================
-- KECA 강의공고 & 강사지원 시스템 DB 마이그레이션
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

-- 1. 강의공고 테이블
CREATE TABLE IF NOT EXISTS lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  location TEXT,
  lecture_date DATE,
  lecture_time TEXT,
  duration TEXT,
  target TEXT,
  required_count INTEGER NOT NULL DEFAULT 1,
  max_applicants INTEGER,
  fee TEXT,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'completed')),
  deadline DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 강사 지원 테이블
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  portfolio_url TEXT,
  cover_letter TEXT,
  deposit_payment_id UUID,  -- payments 테이블 참조 (circular 방지로 FK 없음)
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'deposit_pending', 'submitted', 'selected', 'rejected', 'cancelled')),
  selected_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lecture_id, applicant_id)
);

-- 3. payments 테이블 payment_type에 'deposit' 추가
-- (기존 constraint 이름이 다를 수 있으므로 DROP CONSTRAINT 사용)
DO $$
BEGIN
  -- 기존 check constraint 제거 후 재추가
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
  ALTER TABLE payments ADD CONSTRAINT payments_payment_type_check
    CHECK (payment_type IN ('annual_membership', 'certification_fee', 'program_fee', 'deposit'));
EXCEPTION WHEN OTHERS THEN
  -- constraint가 없거나 이미 처리된 경우 무시
  NULL;
END $$;

-- 4. Row Level Security
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- lectures: 누구나 조회 가능, 관리자만 CRUD
CREATE POLICY "lectures_public_read" ON lectures
  FOR SELECT USING (true);

CREATE POLICY "lectures_admin_insert" ON lectures
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "lectures_admin_update" ON lectures
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "lectures_admin_delete" ON lectures
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- applications: 본인 또는 관리자만 조회, 본인만 삽입
CREATE POLICY "applications_read" ON applications
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "applications_insert" ON applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "applications_update" ON applications
  FOR UPDATE USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Supabase Storage: portfolios 버킷 생성 (Storage 탭에서도 가능)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', false)
-- ON CONFLICT DO NOTHING;

-- 완료
SELECT 'Migration completed successfully' AS result;
