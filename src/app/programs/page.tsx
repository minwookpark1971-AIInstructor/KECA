import { Suspense } from "react";
import { getCategories, getPrograms, getAllCategoryImages } from "@/lib/supabase/queries";
import ProgramsContent from "./ProgramsContent";

export default async function ProgramsPage() {
  const [categories, programs, categoryImages] = await Promise.all([
    getCategories(),
    getPrograms(),
    getAllCategoryImages(),
  ]);

  return (
    <Suspense fallback={<div className="py-20 text-center text-text-muted">로딩 중...</div>}>
      <ProgramsContent categories={categories} programs={programs} categoryImages={categoryImages} />
    </Suspense>
  );
}
