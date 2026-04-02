import { notFound } from "next/navigation";
import { getProgramById, getCategories, getProgramImages } from "@/lib/supabase/queries";
import ProgramEditClient from "./ProgramEditClient";

export default async function AdminProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [program, categories, images] = await Promise.all([
    getProgramById(id),
    getCategories(),
    getProgramImages(id),
  ]);
  if (!program) notFound();

  return <ProgramEditClient program={program} categories={categories} initialImages={images} />;
}
