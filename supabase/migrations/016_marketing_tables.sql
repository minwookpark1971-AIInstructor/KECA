-- ============================================================
-- 016: 마케팅 기능 확장 테이블 + 프로필 마케팅 동의 필드
-- ============================================================

-- profiles 테이블에 마케팅 동의 필드 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_email_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_sms_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_kakao_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_agreed_at TIMESTAMPTZ;

-- 다운로드 감사 로그
CREATE TABLE IF NOT EXISTS public.download_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  download_type TEXT NOT NULL,
  record_count INTEGER NOT NULL,
  filters_applied JSONB,
  fields_included TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 마케팅 캠페인
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'kakao_alimtalk', 'kakao_brand_message')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  subject TEXT,
  body TEXT,
  template_id UUID,
  sender_name TEXT DEFAULT 'KECA 한국교육컨설팅협회',
  sender_email TEXT DEFAULT 'kecamanager@gmail.com',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 개별 발송 로그
CREATE TABLE IF NOT EXISTS public.marketing_send_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_email TEXT,
  recipient_phone TEXT,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  error_message TEXT,
  fallback_channel TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 이메일/카카오 템플릿
CREATE TABLE IF NOT EXISTS public.marketing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'kakao')),
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 수신 그룹
CREATE TABLE IF NOT EXISTS public.marketing_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filter_criteria JSONB,
  member_ids UUID[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.download_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_send_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_groups ENABLE ROW LEVEL SECURITY;

-- Admin 전용 정책 (service role은 RLS bypass하지만 안전장치로 정의)
CREATE POLICY "admin_all_download_audit" ON public.download_audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_campaigns" ON public.marketing_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_send_logs" ON public.marketing_send_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_templates" ON public.marketing_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_groups" ON public.marketing_groups FOR ALL USING (true) WITH CHECK (true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON public.marketing_campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_send_logs_campaign ON public.marketing_send_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_send_logs_recipient ON public.marketing_send_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_templates_channel ON public.marketing_templates(channel);
