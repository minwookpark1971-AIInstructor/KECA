"use client";

import { useTransition, useState } from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { updateInquiryStatus } from "@/lib/supabase/mutations";
import type { Inquiry } from "@/types";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "신규", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  in_progress: { label: "처리중", color: "bg-amber-100 text-amber-800", icon: Clock },
  completed: { label: "완료", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

export default function InquiriesClient({ inquiries }: { inquiries: Inquiry[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateInquiryStatus(id, status);
        setMsg("상태가 변경되었습니다.");
        setTimeout(() => setMsg(null), 2000);
      } catch {
        setMsg("상태 변경에 실패했습니다.");
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">교육문의 관리</h1>

      {msg && (
        <div className="mb-4 p-3 rounded-lg text-sm bg-green-50 text-green-700">{msg}</div>
      )}

      <div className="space-y-3">
        {inquiries.map((inq) => {
          const st = statusConfig[inq.status] || statusConfig.new;
          return (
            <div key={inq.id} className="bg-white border border-border-light rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text">{inq.company_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="text-sm text-text-sub">{inq.message}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                    <span>{inq.contact_name}</span>
                    <span>{inq.contact_email}</span>
                    <span>{inq.contact_phone}</span>
                    <span>{inq.created_at}</span>
                  </div>
                </div>
                <select
                  defaultValue={inq.status}
                  disabled={isPending}
                  className="shrink-0 text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none disabled:opacity-50"
                  onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                >
                  <option value="new">신규</option>
                  <option value="in_progress">처리중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
          );
        })}
        {inquiries.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">문의 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
