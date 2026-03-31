-- 사이트 설정 테이블 (key-value 방식)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (공개 설정)
CREATE POLICY "site_settings_select" ON public.site_settings
  FOR SELECT USING (true);

-- admin 역할만 수정 가능
CREATE POLICY "site_settings_update" ON public.site_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "site_settings_insert" ON public.site_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 초기 설정값 삽입
INSERT INTO public.site_settings (key, value) VALUES
  ('hero_image_url', NULL),
  ('hero_subtitle', NULL)
ON CONFLICT (key) DO NOTHING;
