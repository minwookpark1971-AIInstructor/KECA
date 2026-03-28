import { getSiteContent } from "@/lib/supabase/queries";
import AboutAdminClient from "./AboutAdminClient";

export default async function AdminAboutPage() {
  const [greeting, vision, organization, history, achievements, benefits, location] = await Promise.all([
    getSiteContent("about_greeting"),
    getSiteContent("about_vision"),
    getSiteContent("about_organization"),
    getSiteContent("about_history"),
    getSiteContent("about_achievements"),
    getSiteContent("about_benefits"),
    getSiteContent("about_location"),
  ]);

  return (
    <AboutAdminClient
      initialData={{
        greeting: (greeting as string) || "",
        vision: (vision as string) || "",
        organization: (organization as string) || "",
        history: (history as string) || "",
        achievements: (achievements as string) || "",
        benefits: (benefits as string) || "",
        location: (location as string) || "",
      }}
    />
  );
}
