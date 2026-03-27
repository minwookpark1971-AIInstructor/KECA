"use client";

import { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Supabase auth.signInWithPassword
    setTimeout(() => {
      alert("목업 모드: Supabase 연동 후 실제 로그인이 가능합니다.");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-primary">KECA</Link>
          <p className="text-sm text-text-sub mt-1">한국교육컨설팅협회 회원 로그인</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white border border-border-light rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">이메일</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">비밀번호</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? "로그인 중..." : <><LogIn size={16} /> 로그인</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-light text-center">
            <p className="text-sm text-text-sub">
              아직 회원이 아니신가요?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* 목업 안내 */}
        <div className="mt-4 bg-surface rounded-xl p-4 text-center">
          <p className="text-xs text-text-muted">
            현재 목업 모드입니다. Supabase 연동 후 실제 인증이 활성화됩니다.
          </p>
          <Link
            href="/mypage"
            className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline"
          >
            마이페이지 미리보기 <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
