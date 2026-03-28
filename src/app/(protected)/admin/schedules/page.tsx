import { getSchedules } from "@/lib/supabase/queries";
import { Plus, Edit2, Trash2, Calendar, MapPin, Monitor, Clock } from "lucide-react";

export default async function AdminSchedulesPage() {
  const schedules = await getSchedules();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">교육일정 관리</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> 일정 추가
        </button>
      </div>

      <div className="space-y-3">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white border border-border-light rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/5 flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] text-primary">{new Date(s.start_date).toLocaleDateString("ko", { month: "short" })}</span>
              <span className="text-lg font-bold text-primary leading-none">{new Date(s.start_date).getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text">{s.title}</h3>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-text-muted">
                {s.start_time && <span className="flex items-center gap-1"><Clock size={12} />{s.start_time}~{s.end_time}</span>}
                {s.is_online ? (
                  <span className="flex items-center gap-1"><Monitor size={12} />온라인</span>
                ) : s.location ? (
                  <span className="flex items-center gap-1"><MapPin size={12} />{s.location}</span>
                ) : null}
              </div>
            </div>
            <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">예정</span>
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1.5 text-text-muted hover:text-primary rounded"><Edit2 size={14} /></button>
              <button className="p-1.5 text-text-muted hover:text-error rounded"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
