import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getSchedules } from "@/lib/supabase/queries";
import { Calendar, MapPin, Monitor, Clock } from "lucide-react";

export const metadata: Metadata = { title: "교육일정" };

export default async function SchedulePage() {
  const mockSchedules = await getSchedules();
  return (
    <>
      <SubpageHero title="교육일정" breadcrumb={[{ label: "커뮤니티" }, { label: "교육일정" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <div className="space-y-4">
            {mockSchedules.map((schedule) => {
              const date = new Date(schedule.start_date);
              const month = date.toLocaleDateString("ko-KR", { month: "short" });
              const day = date.getDate();

              return (
                <div key={schedule.id} className="flex gap-4 bg-white border border-border-light rounded-xl p-5 card-hover">
                  {/* 날짜 뱃지 */}
                  <div className="shrink-0 w-16 h-16 rounded-xl bg-primary/5 flex flex-col items-center justify-center">
                    <span className="text-xs text-primary font-medium">{month}</span>
                    <span className="text-xl font-bold text-primary">{day}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text mb-2">{schedule.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-sub">
                      {schedule.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {schedule.start_time} ~ {schedule.end_time}
                        </span>
                      )}
                      {schedule.is_online ? (
                        <span className="flex items-center gap-1">
                          <Monitor size={12} /> 온라인
                        </span>
                      ) : schedule.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {schedule.location}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 self-center">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                      예정
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
