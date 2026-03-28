import { getCategories } from "@/lib/supabase/queries";
import ProgramNewClient from "./ProgramNewClient";

export default async function AdminProgramNewPage() {
  const categories = await getCategories();
  return <ProgramNewClient categories={categories} />;
}
