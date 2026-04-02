import { getCategories, getAllCategoryImages } from "@/lib/supabase/queries";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const [categories, allImages] = await Promise.all([getCategories(), getAllCategoryImages()]);
  return <CategoriesClient categories={categories} allImages={allImages} />;
}
