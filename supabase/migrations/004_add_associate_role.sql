-- 준회원(associate) 역할 추가
-- profiles 테이블의 role CHECK 제약조건 업데이트

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('pending','approved','associate','member','instructor','admin'));
