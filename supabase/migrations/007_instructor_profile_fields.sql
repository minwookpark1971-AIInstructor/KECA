-- ============================================================
-- 강사 프로필 제출/검토 관련 컬럼 추가
-- ============================================================

-- PDF 프로필 문서 URL
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_pdf_url TEXT;

-- 프로필 제출 상태: none(미작성), draft(임시저장), submitted(제출), approved(승인), rejected(반려)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_status TEXT NOT NULL DEFAULT 'none'
    CHECK (profile_status IN ('none','draft','submitted','approved','rejected'));

-- 관리자 반려 사유
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_reject_reason TEXT;
