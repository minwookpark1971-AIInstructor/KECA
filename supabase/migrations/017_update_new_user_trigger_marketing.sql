-- ============================================================
-- 017: handle_new_user 트리거 업데이트 — 마케팅 동의 필드 반영
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, phone, role,
    marketing_email_agreed, marketing_kakao_agreed, marketing_agreed_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'phone',
    'pending',
    COALESCE((NEW.raw_user_meta_data->>'marketing_email_agreed')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'marketing_kakao_agreed')::boolean, false),
    CASE
      WHEN (NEW.raw_user_meta_data->>'marketing_email_agreed')::boolean = true
        OR (NEW.raw_user_meta_data->>'marketing_kakao_agreed')::boolean = true
      THEN now()
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
