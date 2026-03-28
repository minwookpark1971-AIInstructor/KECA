import { notFound } from "next/navigation";
import { getInstructorById } from "@/lib/supabase/queries";
import InstructorEditClient from "./InstructorEditClient";

export default async function AdminInstructorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = await getInstructorById(id);
  if (!instructor) notFound();

  return <InstructorEditClient instructor={instructor} />;
}
