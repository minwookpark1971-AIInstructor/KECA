import { getInquiries } from "@/lib/supabase/queries";
import InquiriesClient from "./InquiriesClient";

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();
  return <InquiriesClient inquiries={inquiries} />;
}
