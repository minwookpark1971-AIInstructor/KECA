import { notFound } from "next/navigation";
import { getProgramById, getCategories } from "@/lib/supabase/queries";
import ProgramEditClient from "./ProgramEditClient";

export default async function AdminProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [program, categories] = await Promise.all([getProgramById(id), getCategories()]);
  if (!program) notFound();

  return <ProgramEditClient program={program} categories={categories} />;
}
