"use client";

<<<<<<< HEAD
import { useState } from "react";
import Link from "next/link";
=======
import Link from "next/link";
import { useState } from "react";
>>>>>>> 263dd1c7d81a75adc07a4c816af1a692986eac76
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch {
      setError("재설정 링크 발송 중 오류가 발생했습니다. 이메일 주소를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

=======
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white border border-border-light rounded-2xl p-8 shadow-card">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text mb-2">이메일을 확인해주세요</h2>
            <p className="text-sm text-text-sub mb-6">
              <strong>{email}</strong>로 비밀번호 재설정 링크를 발송했습니다.
              <br />이메일에 포함된 링크를 클릭하여 비밀번호를 재설정해주세요.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              <ArrowLeft size={14} /> 로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    );
  }

>>>>>>> 263dd1c7d81a75adc07a4c816af1a692986eac76
  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-primary">KECA</Link>
          <p className="text-sm text-text-sub mt-1">비밀번호 재설정</p>
        </div>

        <div className="bg-white border border-border-light rounded-2xl p-8 shadow-card">
<<<<<<< HEAD
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
              <h2 className="text-lg font-bold text-text mb-2">이메일을 확인해주세요</h2>
              <p className="text-sm text-text-sub leading-relaxed">
                <strong>{email}</strong>으로 비밀번호 재설정 링크를 발송했습니다.
                이메일의 링크를 클릭하여 새 비밀번호를 설정해주세요.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 mt-6 text-sm text-primary font-medium hover:underline"
              >
                <ArrowLeft size={14} /> 로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-sub mb-6 leading-relaxed">
                가입 시 등록한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {loading ? "발송 중..." : "재설정 링크 발송"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border-light text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-text-sub hover:text-primary transition-colors"
                >
                  <ArrowLeft size={14} /> 로그인으로 돌아가기
                </Link>
              </div>
            </>
          )}
=======
          <p className="text-sm text-text-sub mb-6">
            가입 시 사용한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? "발송 중..." : "재설정 링크 발송"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-light text-center">
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-text-sub hover:text-primary transition-colors">
              <ArrowLeft size={14} /> 로그인으로 돌아가기
            </Link>
          </div>
>>>>>>> 263dd1c7d81a75adc07a4c816af1a692986eac76
        </div>
      </div>
    </section>
  );
}
