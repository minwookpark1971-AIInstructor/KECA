import { getSiteContent } from "@/lib/supabase/queries";
import CertificationAdminClient from "./CertificationAdminClient";

export default async function AdminCertificationPage() {
  const [overview, standards, apply, graduates] = await Promise.all([
    getSiteContent("cert_overview"),
    getSiteContent("cert_standards"),
    getSiteContent("cert_apply"),
    getSiteContent("cert_graduates"),
  ]);

  return (
    <CertificationAdminClient
      initialData={{
        overview: (overview as string) || "",
        standards: (standards as string) || "",
        apply: (apply as string) || "",
        graduates: (graduates as string) || "",
      }}
    />
  );
}
