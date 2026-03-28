import { getCategories } from "@/lib/supabase/queries";
import InquiryContent from "./InquiryContent";

export default async function InquiryPage() {
  const categories = await getCategories();

  return <InquiryContent categories={categories} />;
}
