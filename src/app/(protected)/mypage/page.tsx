import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getCurrentUser } from "@/lib/supabase/queries";
import { roleLabels, roleBadgeColors } from "@/lib/utils";
import { User, CreditCard, Edit, ChevronRight, Shield, Calendar } from "lucide-react";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const roleLabel = roleLabels[user.role] || user.role;
  const badgeColor = roleBadgeColors[user.role] || "bg-gray-100 text-gray-800";

  const quickLinks = [
    { label: "프로필 수정", href: "/mypage/profile", icon: Edit, desc: "이름, 연락처, 비밀번호 변경" },
    { label: "협회비 납부", href: "/mypage/membership", icon: CreditCard, desc: "납부 현황 및 결제" },
  ];

  return (
    <>
      <SubpageHero title="마이페이지" breadcrumb={[{ label: "마이페이지" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          {/* 회원 정보 카드 */}
          <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User size={28} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-text">{user.name}</h2>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeColor}`}>{roleLabel}</span>
                </div>
                <p className="text-sm text-text-sub">{user.email}</p>
                {user.phone && <p className="text-sm text-text-muted mt-0.5">{user.phone}</p>}
              </div>
            </div>

            {/* 회원 상태 */}
            <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border-light">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-text-muted">회원 상태</p>
                  <p className="text-sm font-medium text-text">{roleLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-text-muted">가입일</p>
                  <p className="text-sm font-medium text-text">{user.created_at}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-primary" />
                <div>
                  <p className="text-xs text-text-muted">협회비 만료</p>
                  <p className="text-sm font-medium text-text">{user.membership_expires_at || "미납"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div className="grid sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 bg-white border border-border-light rounded-xl p-5 card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <link.icon size={22} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text">{link.label}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-text-muted shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
