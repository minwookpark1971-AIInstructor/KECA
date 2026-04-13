import { getMarketingTemplates } from "@/lib/supabase/queries";
import EmailComposeClient from "./EmailComposeClient";

export default async function EmailComposePage() {
  const templates = await getMarketingTemplates("email");
  return <EmailComposeClient templates={templates} />;
}
