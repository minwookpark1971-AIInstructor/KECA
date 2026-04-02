import { Metadata } from "next";
import Link from "next/link";
import { getMembersForAdmin, getPrograms, getSchedules, getPostsByBoard, getPayments } from "@/lib/supabase/queries";
import {
  Users, UserCheck, UserX, GraduationCap, BookOpen,
  CreditCard, CalendarDays, Bell, ArrowRight,
} from "lucide-react";

export const metadata: Metadata = { title: "관리자 대시보드" };

export default async function AdminDashboardPage() {
  const [members, programs, schedules, notices, payments] = await Promise.all([
    getMembersForAdmin(),
    getPrograms(),
    getSchedules(),
    getPostsByBoard("notice", 5),
    getPayments(),
  ]);

  const totalMembers = members.length;
  const pendingMembers = members.filter((u) => u.role === "pending").length;
  const instructors = members.filter((u) => u.is_instructor).length;
  const publishedPrograms = programs.length;

  const statCards = [
    { label: "전체 회원", value: totalMembers, icon: Users, color: "bg-blue-50 text-blue-600", href: "/admin/members" },
    { label: "승인 대기", value: pendingMembers, icon: UserX, color: "bg-amber-50 text-amber-600", href: "/admin/members" },
    { label: "강사", value: instructors, icon: GraduationCap, color: "bg-purple-50 text-purple-600", href: "/admin/instructors" },
    { label: "교육프로그램", value: publishedPrograms, icon: BookOpen, color: "bg-green-50 text-green-600", href: "/admin/programs" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-border-light rounded-xl p-5 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">{card.label}</p>
                <p className="text-2xl font-bold text-text mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 승인 대기 회원 */}
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <UserCheck size={16} /> 승인 대기 회원
            </h2>
            <Link href="/admin/members" className="text-xs text-primary hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          {pendingMembers > 0 ? (
            <div className="space-y-2">
              {members.filter((u) => u.role === "pending").map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text">{user.name}</p>
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">대기중</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">대기 중인 회원이 없습니다.</p>
          )}
        </div>

        {/* 최근 공지사항 */}
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <Bell size={16} /> 최근 공지
            </h2>
            <Link href="/admin/community/notice" className="text-xs text-primary hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {notices.slice(0, 4).map((notice) => (
              <div key={notice.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <p className="text-sm text-text truncate flex-1 mr-4">{notice.title}</p>
                <span className="text-xs text-text-muted shrink-0">{notice.created_at}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 교육일정 */}
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <CalendarDays size={16} /> 예정 교육일정
            </h2>
            <Link href="/admin/schedules" className="text-xs text-primary hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {schedules.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <p className="text-sm text-text truncate flex-1 mr-4">{s.title}</p>
                <span className="text-xs text-text-muted shrink-0">{s.start_date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 현황 */}
        <div className="bg-white border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <CreditCard size={16} /> 결제 현황
            </h2>
            <Link href="/admin/payments" className="text-xs text-primary hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center py-4">
            <div>
              <p className="text-2xl font-bold text-text">{payments.length}</p>
              <p className="text-xs text-text-muted mt-1">총 결제 건수</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}원</p>
              <p className="text-xs text-text-muted mt-1">총 결제 금액</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
