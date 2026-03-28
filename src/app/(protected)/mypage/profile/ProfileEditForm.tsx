"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { Save, User, Phone, Lock, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export default function ProfileEditForm({ user }: { user: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone })
      .eq("id", user.id);

    if (error) {
      setProfileMsg({ type: "error", text: "프로필 저장에 실패했습니다." });
    } else {
      setProfileMsg({ type: "success", text: "프로필이 저장되었습니다." });
      router.refresh();
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword.length < 8) {
      setPwMsg({ type: "error", text: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "비밀번호가 일치하지 않습니다." });
      return;
    }

    setChangingPw(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPwMsg({ type: "error", text: error.message });
    } else {
      setPwMsg({ type: "success", text: "비밀번호가 변경되었습니다." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPw(false);
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

            {profileMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${profileMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                {profileMsg.type === "success" && <CheckCircle size={16} />}
                {profileMsg.text}
              </div>
            )}

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

            {pwMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${pwMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                {pwMsg.type === "success" && <CheckCircle size={16} />}
                {pwMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">새 비밀번호</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8자 이상 입력"
                    required
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={changingPw}
                className="flex items-center gap-2 bg-text text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-text/80 transition-colors disabled:opacity-50"
              >
                <Lock size={16} /> {changingPw ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
