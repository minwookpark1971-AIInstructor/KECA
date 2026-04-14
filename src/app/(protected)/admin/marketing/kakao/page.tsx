import { getAllMarketingTemplates } from "@/lib/supabase/queries";
import KakaoComposeClient from "./KakaoComposeClient";
import type { MarketingTemplate } from "@/types";

export default async function KakaoComposePage() {
  let templates: MarketingTemplate[] = [];
  try {
    templates = await getAllMarketingTemplates("kakao");
  } catch (e) {
    console.error("[KakaoComposePage] 템플릿 로드 실패:", e);
  }
  return <KakaoComposeClient templates={templates} />;
}
