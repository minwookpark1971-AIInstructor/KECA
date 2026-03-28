import { getCategories } from "@/lib/supabase/queries";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient categories={categories} />;
}
