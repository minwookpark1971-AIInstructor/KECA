import { getPartners } from "@/lib/supabase/queries";
import PartnersClient from "./PartnersClient";

export default async function AdminPartnersPage() {
  const partners = await getPartners();
  return <PartnersClient partners={partners} />;
}
