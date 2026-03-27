"use client";

import { HelpCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";

const mockInquiries = [
  { id: "iq1", company: "삼성전자", contact: "김담당", email: "kim@samsung.com", phone: "010-1111-2222", type: "corporate", message: "AI 활용 교육 50명 대상 문의", status: "new", date: "2026-03-25" },
  { id: "iq2", company: "서울시교육청", contact: "이담당", email: "lee@sen.go.kr", phone: "010-3333-4444", type: "government", message: "교원 대상 에듀테크 연수 프로그램", status: "in_progress", date: "2026-03-20" },
  { id: "iq3", company: "○○대학교", contact: "박교수", email: "park@univ.ac.kr", phone: "010-5555-6666", type: "school", message: "대학생 진로교육 프로그램 문의", status: "completed", date: "2026-03-15" },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "신규", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  in_progress: { label: "처리중", color: "bg-amber-100 text-amber-800", icon: Clock },
  completed: { label: "완료", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

export default function AdminInquiriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">교육문의 관리</h1>

      <div className="space-y-3">
        {mockInquiries.map((inq) => {
          const st = statusConfig[inq.status] || statusConfig.new;
          return (
            <div key={inq.id} className="bg-white border border-border-light rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text">{inq.company}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-sm text-text-sub">{inq.message}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                    <span>{inq.contact}</span>
                    <span>{inq.email}</span>
                    <span>{inq.phone}</span>
                    <span>{inq.date}</span>
                  </div>
                </div>
                <select
                  defaultValue={inq.status}
                  className="shrink-0 text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none"
                  onChange={() => alert("목업: 상태 변경")}
                >
                  <option value="new">신규</option>
                  <option value="in_progress">처리중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
