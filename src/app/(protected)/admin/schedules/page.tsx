import { getSchedules } from "@/lib/supabase/queries";
import SchedulesClient from "./SchedulesClient";

export default async function AdminSchedulesPage() {
  const schedules = await getSchedules();
  return <SchedulesClient schedules={schedules} />;
}
