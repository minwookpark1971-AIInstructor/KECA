"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { MarketingCampaign } from "@/types";

const channelLabels: Record<string, string> = {
  email: "이메일",
  kakao_alimtalk: "알림톡",
  kakao_brand_message: "브랜드 메시지",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "초안", color: "bg-gray-100 text-gray-700" },
  scheduled: { label: "예약됨", color: "bg-blue-100 text-blue-700" },
  sending: { label: "발송중", color: "bg-yellow-100 text-yellow-700" },
  sent: { label: "발송완료", color: "bg-green-100 text-green-700" },
  failed: { label: "실패", color: "bg-red-100 text-red-700" },
  cancelled: { label: "취소", color: "bg-gray-100 text-gray-500" },
};

export default function HistoryClient({ campaigns }: { campaigns: MarketingCampaign[] }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/marketing" className="p-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} className="text-text-sub" />
        </Link>
        <h1 className="text-2xl font-bold text-text">발송 이력</h1>
      </div>

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        {campaigns.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">발송 이력이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border-light text-text-sub">
                  <th className="text-left px-5 py-3 font-medium">제목</th>
                  <th className="text-center px-3 py-3 font-medium">채널</th>
                  <th className="text-center px-3 py-3 font-medium">상태</th>
                  <th className="text-center px-3 py-3 font-medium">수신자</th>
                  <th className="text-center px-3 py-3 font-medium hidden sm:table-cell">성공</th>
                  <th className="text-center px-3 py-3 font-medium hidden sm:table-cell">실패</th>
                  <th className="text-right px-5 py-3 font-medium hidden md:table-cell">발송일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {campaigns.map((c) => {
                  const st = statusConfig[c.status] || { label: c.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={c.id} className="hover:bg-surface/50">
                      <td className="px-5 py-3 font-medium text-text">{c.title || c.subject || "(제목 없음)"}</td>
                      <td className="px-3 py-3 text-center text-xs text-text-sub">
                        {channelLabels[c.channel] || c.channel}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-text-sub">{c.total_recipients}명</td>
                      <td className="px-3 py-3 text-center text-green-600 hidden sm:table-cell">{c.success_count}</td>
                      <td className="px-3 py-3 text-center text-red-500 hidden sm:table-cell">{c.fail_count}</td>
                      <td className="px-5 py-3 text-right text-text-muted text-xs hidden md:table-cell">
                        {c.sent_at ? new Date(c.sent_at).toLocaleString("ko") : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
