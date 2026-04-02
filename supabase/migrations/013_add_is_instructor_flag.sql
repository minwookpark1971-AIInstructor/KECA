-- is_instructor 플래그 추가: role은 회원등급만 담당, 강사 여부는 별도 관리
ALTER TABLE public.profiles ADD COLUMN is_instructor BOOLEAN NOT NULL DEFAULT false;

-- 기존 instructor 역할 데이터 마이그레이션
-- 회비 납부한 강사 → 정회원 + 강사
UPDATE public.profiles SET is_instructor = true, role = 'member'
  WHERE role = 'instructor' AND membership_paid_at IS NOT NULL;
-- 회비 미납 강사 → 준회원 + 강사
UPDATE public.profiles SET is_instructor = true, role = 'associate'
  WHERE role = 'instructor' AND membership_paid_at IS NULL;

-- role CHECK 제약조건 업데이트 (instructor 제거)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('pending','approved','associate','member','admin'));

-- RLS 정책: 공개 강사 프로필 조회 (is_instructor 기반으로 변경)
DROP POLICY IF EXISTS "공개 강사 프로필 조회" ON public.profiles;
CREATE POLICY "공개 강사 프로필 조회" ON public.profiles
  FOR SELECT USING (is_profile_public = true AND is_instructor = true);
