"use client";

import { useState } from "react";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Save, User, Phone, Lock } from "lucide-react";
import type { Profile } from "@/types";

export default function ProfileEditForm({ user }: { user: Profile }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert("목업 모드: 프로필이 저장되었습니다.");
      setSaving(false);
    }, 500);
  };

  return (
    <>
      <SubpageHero
        title="프로필 수정"
        breadcrumb={[{ label: "마이페이지", href: "/mypage" }, { label: "프로필 수정" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-2xl">
          {/* 기본 정보 */}
          <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-8 mb-6">
            <h2 className="text-lg font-bold text-text mb-6">기본 정보</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이메일</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-surface text-text-muted"
                />
                <p className="text-xs text-text-muted mt-1">이메일은 변경할 수 없습니다.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">이름</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">연락처</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                <Save size={16} /> {saving ? "저장 중..." : "저장"}
              </button>
            </form>
          </div>

          {/* 비밀번호 변경 */}
          <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-8">
            <h2 className="text-lg font-bold text-text mb-6">비밀번호 변경</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("목업 모드: 비밀번호 변경 기능은 Supabase 연동 후 활성화됩니다.");
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">새 비밀번호</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    placeholder="8자 이상 입력"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">비밀번호 확인</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    placeholder="비밀번호를 다시 입력"
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-text text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-text/80 transition-colors"
              >
                <Lock size={16} /> 비밀번호 변경
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
