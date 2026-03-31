import { getCategories, getPrograms } from "@/lib/supabase/queries";
import InquiryContent from "./InquiryContent";

export default async function InquiryPage() {
  const [categories, programs] = await Promise.all([
    getCategories(),
    getPrograms(),
  ]);

  return <InquiryContent categories={categories} programs={programs} />;
}
