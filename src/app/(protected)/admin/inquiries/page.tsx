import { getInquiries, getEnrollmentsForAdmin } from "@/lib/supabase/queries";
import InquiriesClient from "./InquiriesClient";

export default async function AdminInquiriesPage() {
  const [inquiries, enrollments] = await Promise.all([
    getInquiries(),
    getEnrollmentsForAdmin(),
  ]);
  return <InquiriesClient inquiries={inquiries} enrollments={enrollments} />;
}
