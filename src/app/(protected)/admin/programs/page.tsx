import { getAllPrograms, getCategories } from "@/lib/supabase/queries";
import ProgramsListClient from "./ProgramsListClient";

export default async function AdminProgramsPage() {
  const [programs, categories] = await Promise.all([getAllPrograms(), getCategories()]);
  return <ProgramsListClient programs={programs} categories={categories} />;
}
