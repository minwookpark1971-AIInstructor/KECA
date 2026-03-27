"use client";

import Link from "next/link";
import { useState } from "react";
import { User, Mail, Phone, Lock, UserPlus, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    // TODO: Supabase auth.signUp
    setTimeout(() => {
      alert("목업 모드: Supabase 연동 후 실제 회원가입이 가능합니다.");
      setLoading(false);
    }, 1000);
  };

  const fields = [
    { name: "name", label: "이름", type: "text", icon: User, placeholder: "홍길동" },
    { name: "email", label: "이메일", type: "email", icon: Mail, placeholder: "example@email.com" },
    { name: "phone", label: "연락처", type: "tel", icon: Phone, placeholder: "010-0000-0000" },
    { name: "password", label: "비밀번호", type: "password", icon: Lock, placeholder: "8자 이상" },
    { name: "confirmPassword", label: "비밀번호 확인", type: "password", icon: Lock, placeholder: "비밀번호를 다시 입력" },
  ];

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-primary">KECA</Link>
          <p className="text-sm text-text-sub mt-1">한국교육컨설팅협회 회원가입</p>
        </div>

        <div className="bg-white border border-border-light rounded-2xl p-8 shadow-card">
          {/* 안내 */}
          <div className="bg-primary/5 rounded-lg p-3 mb-6 flex items-start gap-2">
            <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-text-sub leading-relaxed">
              회원가입 후 관리자 승인이 완료되면 정회원 서비스를 이용하실 수 있습니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-text mb-1.5">{field.label}</label>
                <div className="relative">
                  <field.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            ))}

            {/* 약관 동의 */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-xs text-text-sub">
                <Link href="#" className="text-primary hover:underline">이용약관</Link> 및{" "}
                <Link href="#" className="text-primary hover:underline">개인정보처리방침</Link>에 동의합니다.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? "처리 중..." : <><UserPlus size={16} /> 회원가입</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-light text-center">
            <p className="text-sm text-text-sub">
              이미 회원이신가요?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">로그인</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
