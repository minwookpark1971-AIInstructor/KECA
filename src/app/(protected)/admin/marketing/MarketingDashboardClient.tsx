"use client";

import Link from "next/link";
import { Mail, MessageSquare, BarChart3, Send, Clock, FileText, Users } from "lucide-react";
import type { MarketingCampaign } from "@/types";

const channelLabels: Record<string, string> = {
  email: "이메일",
  kakao_alimtalk: "알림톡",
  kakao_brand_message: "브랜드 메시지",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "초안", color: "bg-gray-100 text-gray-700" },
  scheduled: { label: "예약됨", color: "bg-blue-100 text-blue-700" },
  sending: { label: "발송중", color: "bg-yellow-100 text-yellow-700" },
  sent: { label: "발송완료", color: "bg-green-100 text-green-700" },
  failed: { label: "실패", color: "bg-red-100 text-red-700" },
  cancelled: { label: "취소", color: "bg-gray-100 text-gray-500" },
};

interface Props {
  stats: {
    totalCampaigns: number;
    thisMonthSent: number;
    recentCampaigns: MarketingCampaign[];
  };
}

export default function MarketingDashboardClient({ stats }: Props) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">마케팅 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Send size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted">총 캠페인</p>
              <p className="text-2xl font-bold text-text">{stats.totalCampaigns}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <BarChart3 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">이번 달 발송</p>
              <p className="text-2xl font-bold text-text">{stats.thisMonthSent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">빠른 발송</p>
              <div className="flex gap-2 mt-1">
                <Link href="/admin/marketing/email" className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors">이메일</Link>
                <Link href="/admin/marketing/kakao" className="text-xs px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors">카카오톡</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "이메일 발송", href: "/admin/marketing/email", icon: Mail, color: "text-primary" },
          { label: "카카오톡 발송", href: "/admin/marketing/kakao", icon: MessageSquare, color: "text-yellow-600" },
          { label: "발송 이력", href: "/admin/marketing/history", icon: Clock, color: "text-gray-600" },
          { label: "템플릿 관리", href: "/admin/marketing/templates", icon: FileText, color: "text-green-600" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white border border-border-light rounded-xl p-4 hover:bg-surface transition-colors flex items-center gap-3"
          >
            <item.icon size={20} className={item.color} />
            <span className="text-sm font-medium text-text">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* 최근 캠페인 */}
      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
          <h2 className="text-base font-bold text-text">최근 캠페인</h2>
          <Link href="/admin/marketing/history" className="text-xs text-primary hover:underline">전체 보기</Link>
        </div>
        {stats.recentCampaigns.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">아직 발송된 캠페인이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-text-sub border-b border-border-light">
                <th className="text-left px-5 py-2.5 font-medium">제목</th>
                <th className="text-center px-3 py-2.5 font-medium">채널</th>
                <th className="text-center px-3 py-2.5 font-medium">상태</th>
                <th className="text-center px-3 py-2.5 font-medium hidden sm:table-cell">수신자</th>
                <th className="text-right px-5 py-2.5 font-medium hidden md:table-cell">발송일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {stats.recentCampaigns.map((c) => {
                const st = statusLabels[c.status] || { label: c.status, color: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={c.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3 font-medium text-text">{c.title}</td>
                    <td className="px-3 py-3 text-center text-text-sub text-xs">{channelLabels[c.channel] || c.channel}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-text-sub hidden sm:table-cell">{c.total_recipients}명</td>
                    <td className="px-5 py-3 text-right text-text-muted text-xs hidden md:table-cell">
                      {c.sent_at ? new Date(c.sent_at).toLocaleDateString("ko") : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
