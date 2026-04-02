-- applications 테이블 DELETE 정책 추가 (누락되어 있었음)
-- 본인 지원 또는 관리자만 삭제 가능
CREATE POLICY "applications_delete" ON public.applications
  FOR DELETE USING (
    applicant_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
