import { getMarketingTemplates } from "@/lib/supabase/queries";
import TemplatesClient from "./TemplatesClient";

export default async function TemplatesPage() {
  const templates = await getMarketingTemplates();
  return <TemplatesClient templates={templates} />;
}
