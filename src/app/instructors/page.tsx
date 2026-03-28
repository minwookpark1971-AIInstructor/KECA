import { getInstructors } from "@/lib/supabase/queries";
import InstructorsContent from "./InstructorsContent";

export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return <InstructorsContent instructors={instructors} />;
}
