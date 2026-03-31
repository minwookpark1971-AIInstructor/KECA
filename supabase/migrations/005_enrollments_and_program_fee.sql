-- 005: enrollments 테이블 추가 + payments CHECK 확장

-- 1. payments 테이블 program_fee 지원
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_payment_type_check
  CHECK (payment_type IN ('annual_membership','certification_fee','program_fee'));

-- 2. inquiries 테이블에 user_id 컬럼 추가 (로그인 사용자 문의 연동)
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. enrollments (수강 신청) 테이블
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending','approved','paid','completed','cancelled')
  ),
  fee INTEGER,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  admin_note TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON public.enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 사용자: 자신의 수강 신청만 조회
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자: 자신의 수강 신청 생성
CREATE POLICY "Users can create own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자: 전체 조회/수정
CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
