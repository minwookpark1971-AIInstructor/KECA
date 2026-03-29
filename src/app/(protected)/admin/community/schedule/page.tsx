import { getSchedules } from "@/lib/supabase/queries";
import SchedulesClient from "../../schedules/SchedulesClient";

export default async function CommunitySchedulePage() {
  const schedules = await getSchedules();
  return <SchedulesClient schedules={schedules} />;
}
