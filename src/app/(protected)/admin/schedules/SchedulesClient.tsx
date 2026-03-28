"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Calendar, MapPin, Monitor, Clock, Save, X } from "lucide-react";
import { createSchedule, deleteSchedule } from "@/lib/supabase/mutations";
import type { Schedule } from "@/types";

export default function SchedulesClient({ schedules }: { schedules: Schedule[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const handleAdd = () => {
    if (!title.trim() || !startDate) return;
    startTransition(async () => {
      try {
        await createSchedule({
          title,
          start_date: startDate,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          location: location || undefined,
          is_online: isOnline,
        });
        setTitle("");
        setStartDate("");
        setStartTime("");
        setEndTime("");
        setLocation("");
        setIsOnline(false);
        setShowForm(false);
        setMsg({ type: "success", text: "일정이 추가되었습니다." });
      } catch {
        setMsg({ type: "error", text: "일정 추가에 실패했습니다." });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" 일정을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteSchedule(id);
        setMsg({ type: "success", text: "일정이 삭제되었습니다." });
      } catch {
        setMsg({ type: "error", text: "일정 삭제에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">교육일정 관리</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> 일정 추가
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-primary/20 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-text mb-3">새 일정 추가</h3>
          <div className="space-y-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목 *" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <div className="grid sm:grid-cols-3 gap-3">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="시작 시간" className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="종료 시간" className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} className="accent-primary" />
                온라인 교육
              </label>
              {!isOnline && (
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="장소" className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} disabled={isPending} className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50">
              <Save size={14} /> {isPending ? "저장 중..." : "저장"}
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-text-sub border border-border-light hover:bg-surface">
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

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
            <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">{s.status === "completed" ? "완료" : "예정"}</span>
            <button
              onClick={() => handleDelete(s.id, s.title)}
              disabled={isPending}
              className="p-1.5 text-text-muted hover:text-error rounded disabled:opacity-50 shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {schedules.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">등록된 일정이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
