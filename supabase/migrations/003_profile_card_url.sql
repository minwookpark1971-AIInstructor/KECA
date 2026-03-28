-- 강사 프로필 카드 이미지 URL 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_card_url TEXT;
