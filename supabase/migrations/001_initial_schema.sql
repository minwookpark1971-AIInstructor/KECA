-- ============================================================
-- KECA 전체 데이터베이스 스키마
-- Supabase PostgreSQL 마이그레이션
-- ============================================================

-- 1. profiles (회원 프로필)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'pending'
    CHECK (role IN ('pending','approved','member','instructor','admin')),

  -- 강사 전용
  profile_image_url TEXT,
  bio TEXT,
  career_summary TEXT,
  specialties TEXT[],
  video_url TEXT,
  is_profile_public BOOLEAN DEFAULT false,

  -- 회원 상태
  approved_at TIMESTAMPTZ,
  membership_paid_at TIMESTAMPTZ,
  membership_expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. categories (교육프로그램 대분류)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. programs (교육프로그램)
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  program_type TEXT NOT NULL DEFAULT 'education'
    CHECK (program_type IN ('education','expert','certification')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  description TEXT,
  target_audience TEXT,
  duration TEXT,
  curriculum JSONB,
  learning_outcomes TEXT[],
  methodology TEXT,
  features TEXT[],
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. program_images (교육프로그램 상세 이미지)
CREATE TABLE public.program_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. program_instructors (프로그램-강사 배정)
CREATE TABLE public.program_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, instructor_id)
);

-- 6. instructor_categories (강사-분야 매핑)
CREATE TABLE public.instructor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE(instructor_id, category_id)
);

-- 7. inquiries (교육문의)
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type TEXT NOT NULL CHECK (
    inquiry_type IN ('corporate','institution','school','government','other')
  ),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  preferred_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  preferred_program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  estimated_participants TEXT,
  preferred_date TEXT,
  budget_range TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','in_progress','completed','cancelled')),
  admin_note TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. posts (커뮤니티 통합 게시판)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_type TEXT NOT NULL CHECK (
    board_type IN ('notice','review','photo_gallery','video_gallery','resource')
  ),
  title TEXT NOT NULL,
  content TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  file_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. post_images (게시글 이미지)
CREATE TABLE public.post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 10. schedules (교육일정)
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'scheduled' CHECK (
    status IN ('scheduled','ongoing','completed','cancelled')
  ),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. payments (결제)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (
    payment_type IN ('annual_membership','certification_fee')
  ),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  toss_order_id TEXT UNIQUE,
  toss_payment_key TEXT,
  toss_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending','completed','failed','cancelled','refunded')
  ),
  paid_at TIMESTAMPTZ,
  period_start DATE,
  period_end DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. site_settings (사이트 설정)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 13. partners (파트너/협력기관)
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_programs_category ON public.programs(category_id);
CREATE INDEX idx_programs_type ON public.programs(program_type);
CREATE INDEX idx_programs_status ON public.programs(status);
CREATE INDEX idx_programs_featured ON public.programs(is_featured) WHERE is_featured = true;
CREATE INDEX idx_posts_board ON public.posts(board_type);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_schedules_date ON public.schedules(start_date);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);

-- ============================================================
-- Auth 트리거: 새 사용자 → profiles 자동 생성
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'phone',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published programs are viewable by everyone" ON public.programs
  FOR SELECT USING (status = 'published' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can modify programs" ON public.programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- program_images
ALTER TABLE public.program_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Program images are viewable by everyone" ON public.program_images
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify program images" ON public.program_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- program_instructors
ALTER TABLE public.program_instructors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Program instructors viewable by everyone" ON public.program_instructors
  FOR SELECT USING (true);
CREATE POLICY "Only admins can assign instructors" ON public.program_instructors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- instructor_categories
ALTER TABLE public.instructor_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructor categories viewable by everyone" ON public.instructor_categories
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify instructor categories" ON public.instructor_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view/modify inquiries" ON public.inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Only admins can update inquiries" ON public.inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are viewable by everyone" ON public.posts
  FOR SELECT USING (status = 'published' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Members can create reviews" ON public.posts
  FOR INSERT WITH CHECK (
    board_type = 'review' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('member','instructor','admin'))
  );
CREATE POLICY "Admins can manage all posts" ON public.posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- post_images
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post images viewable by everyone" ON public.post_images
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify post images" ON public.post_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schedules are viewable by everyone" ON public.schedules
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify schedules" ON public.schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Only admins can update payments" ON public.payments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Only admins can modify settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active partners viewable by everyone" ON public.partners
  FOR SELECT USING (is_active = true OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can modify partners" ON public.partners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 초기 데이터: 카테고리
-- ============================================================
INSERT INTO public.categories (name, slug, description, icon_name, sort_order) VALUES
  ('AI·에듀테크 교육', 'ai-edutech', '생성형 AI, 업무자동화, 데이터 분석, 콘텐츠 제작, 에듀테크 도구 활용', 'cpu', 1),
  ('진로·진학 컨설팅', 'career', 'AI 기반 진로 진단, 대학 입시 컨설팅, 경력개발 컨설팅', 'compass', 2),
  ('교육컨설팅', 'consulting', '교육과정 설계, 교육기관 운영, 교육성과 분석', 'briefcase', 3),
  ('리더십·조직교육', 'leadership', '교육리더십, 조직활성화, 소통·협업 교육', 'users', 4),
  ('직무역량 강화', 'competency', '프레젠테이션, 보고서 작성, 디지털 리터러시, OA 교육', 'target', 5),
  ('법정의무교육', 'mandatory', '개인정보보호, 직장내 성희롱 예방, 산업안전보건', 'shield', 6);

-- 초기 데이터: 사이트 설정
INSERT INTO public.site_settings (key, value) VALUES
  ('annual_fee', '{"amount": 100000, "description": "연간 협회비"}'),
  ('contact_email', '"info@keca.or.kr"'),
  ('hero_slides', '[]'),
  ('partner_logos', '[]'),
  ('quick_menu_links', '{"kakao":"","youtube":"","blog":""}');
