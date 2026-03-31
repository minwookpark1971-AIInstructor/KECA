-- applications 테이블에 다중 파일 업로드용 document_urls 컬럼 추가
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS document_urls JSONB DEFAULT '[]';
