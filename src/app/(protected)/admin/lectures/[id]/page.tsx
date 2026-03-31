import { getLectureById, getCategories } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import LectureForm from "../LectureForm";

export const metadata = { title: "강의공고 편집" };

export default async function EditLecturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lecture, categories] = await Promise.all([getLectureById(id), getCategories()]);

  if (!lecture) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-text mb-6">강의공고 편집</h1>
      <LectureForm categories={categories} lecture={lecture} />
    </div>
  );
}
