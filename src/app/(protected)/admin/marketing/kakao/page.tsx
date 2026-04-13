import { getMarketingTemplates } from "@/lib/supabase/queries";
import KakaoComposeClient from "./KakaoComposeClient";

export default async function KakaoComposePage() {
  const templates = await getMarketingTemplates("kakao");
  return <KakaoComposeClient templates={templates} />;
}
