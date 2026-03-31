import { getCategories } from "@/lib/supabase/queries";
import LectureForm from "../LectureForm";

export const metadata = { title: "강의공고 등록" };

export default async function NewLecturePage() {
  const categories = await getCategories();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text mb-6">강의공고 등록</h1>
      <LectureForm categories={categories} />
    </div>
  );
}
