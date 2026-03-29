import { getAllPartners } from "@/lib/supabase/queries";
import PartnersClient from "./PartnersClient";

export default async function AdminPartnersPage() {
  const partners = await getAllPartners();
  return <PartnersClient partners={partners} />;
}
