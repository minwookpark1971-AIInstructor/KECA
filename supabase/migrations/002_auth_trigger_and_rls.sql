-- ============================================================
-- KECA: Auth Trigger + RLS 정책
-- ============================================================

-- 1. 회원가입 시 profiles 자동 생성 trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 trigger가 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. RLS (Row Level Security) 정책
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 프로필 조회" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "공개 강사 프로필 조회" ON public.profiles
  FOR SELECT USING (is_profile_public = true AND role = 'instructor');

CREATE POLICY "본인 프로필 수정" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- categories (공개 읽기)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "카테고리 공개 조회" ON public.categories
  FOR SELECT USING (true);

-- programs (공개된 것만 읽기)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 프로그램 조회" ON public.programs
  FOR SELECT USING (status = 'published');

CREATE POLICY "관리자 프로그램 전체 조회" ON public.programs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "관리자 프로그램 관리" ON public.programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- posts (공개 읽기)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 게시글 조회" ON public.posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "관리자 게시글 전체 관리" ON public.posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- schedules (공개 읽기)
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "일정 공개 조회" ON public.schedules
  FOR SELECT USING (true);

CREATE POLICY "관리자 일정 관리" ON public.schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- payments (본인만 조회)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 결제 내역 조회" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "결제 생성" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "관리자 결제 전체 관리" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- inquiries (공개 쓰기, 관리자만 조회)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "문의 작성 (누구나)" ON public.inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "관리자 문의 관리" ON public.inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- partners (공개 읽기)
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "파트너 공개 조회" ON public.partners
  FOR SELECT USING (true);

CREATE POLICY "관리자 파트너 관리" ON public.partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- program_images, program_instructors, instructor_categories, post_images
ALTER TABLE public.program_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "프로그램 이미지 공개 조회" ON public.program_images FOR SELECT USING (true);

ALTER TABLE public.program_instructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "프로그램 강사 공개 조회" ON public.program_instructors FOR SELECT USING (true);

ALTER TABLE public.instructor_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "강사 카테고리 공개 조회" ON public.instructor_categories FOR SELECT USING (true);

-- ============================================================
-- 3. Storage 버킷 설정 (Supabase 대시보드에서 실행)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
