"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send, Eye, X, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Profile, MarketingTemplate } from "@/types";

interface Props {
  templates: MarketingTemplate[];
}

export default function EmailComposeClient({ templates }: Props) {
  const router = useRouter();
  const [recipients, setRecipients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // sessionStorage에서 수신자 ID 로드
  useEffect(() => {
    const stored = sessionStorage.getItem("marketing_recipients");
    if (!stored) {
      setLoading(false);
      return;
    }
    const ids: string[] = JSON.parse(stored);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    // 서버에서 프로필 조회
    fetch(`/api/marketing/send-email?action=get_recipients&ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data) => setRecipients(data.recipients || []))
      .catch(() => setMsg({ type: "error", text: "수신자 정보를 불러오지 못했습니다." }))
      .finally(() => setLoading(false));
  }, []);

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  // 마케팅 미동의 회원 필터
  const agreedRecipients = recipients.filter((r) => r.marketing_email_agreed);
  const notAgreedCount = recipients.length - agreedRecipients.length;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject || "");
      setBody(template.body);
    }
  };

  // 변수 치환 미리보기
  const previewBody = (text: string, sample?: Profile) => {
    if (!sample) return text;
    return text
      .replace(/\{\{name\}\}/g, sample.name)
      .replace(/\{\{email\}\}/g, sample.email)
      .replace(/\{\{role\}\}/g, sample.role);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setMsg({ type: "error", text: "제목과 본문을 입력해주세요." });
      return;
    }
    if (agreedRecipients.length === 0) {
      setMsg({ type: "error", text: "이메일 수신에 동의한 회원이 없습니다." });
      return;
    }

    if (!confirm(`${agreedRecipients.length}명에게 이메일을 발송하시겠습니까?`)) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/marketing/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientIds: agreedRecipients.map((r) => r.id),
          subject,
          body,
          templateId: selectedTemplateId || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "발송 실패");

      setMsg({ type: "success", text: `${result.successCount}명에게 이메일이 발송되었습니다.` });
      sessionStorage.removeItem("marketing_recipients");
      setTimeout(() => router.push("/admin/marketing/history"), 2000);
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "발송에 실패했습니다." });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/marketing" className="p-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} className="text-text-sub" />
        </Link>
        <h1 className="text-2xl font-bold text-text">이메일 발송</h1>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 작성 폼 */}
        <div className="lg:col-span-2 space-y-5">
          {/* 수신자 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <p className="text-sm font-medium text-text mb-3">수신자 ({recipients.length}명)</p>
            {notAgreedCount > 0 && (
              <div className="flex items-center gap-2 mb-3 p-2.5 bg-yellow-50 rounded-lg">
                <AlertTriangle size={14} className="text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  {notAgreedCount}명이 이메일 수신에 동의하지 않아 발송 대상에서 제외됩니다.
                </span>
              </div>
            )}
            {recipients.length === 0 ? (
              <p className="text-sm text-text-muted">
                회원관리에서 회원을 선택한 후 &quot;이메일 발송&quot; 버튼을 눌러주세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {recipients.map((r) => (
                  <span
                    key={r.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${
                      r.marketing_email_agreed
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-400 line-through"
                    }`}
                  >
                    {r.name} ({r.email})
                    <button onClick={() => removeRecipient(r.id)} className="hover:text-error">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 발신자 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <p className="text-sm font-medium text-text mb-2">발신자</p>
            <p className="text-sm text-text-sub">KECA 한국교육컨설팅협회 &lt;kecamanager@gmail.com&gt;</p>
          </div>

          {/* 템플릿 선택 */}
          {templates.length > 0 && (
            <div className="bg-white border border-border-light rounded-xl p-5">
              <p className="text-sm font-medium text-text mb-2">템플릿 선택 (선택사항)</p>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">직접 작성</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 제목 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <p className="text-sm font-medium text-text mb-2">제목</p>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="이메일 제목을 입력하세요"
              className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 본문 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-text">본문</p>
              <p className="text-xs text-text-muted">변수: {"{{name}}"}, {"{{email}}"}, {"{{role}}"}</p>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="이메일 본문을 입력하세요. HTML 태그 사용이 가능합니다.&#10;&#10;예시:&#10;<h2>안녕하세요, {{name}}님!</h2>&#10;<p>KECA 한국교육컨설팅협회에서 알려드립니다.</p>"
              className="w-full px-3 py-2 border border-border-light rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>
        </div>

        {/* 우측: 액션 패널 */}
        <div className="space-y-4">
          <div className="bg-white border border-border-light rounded-xl p-5 sticky top-20">
            <h3 className="text-sm font-bold text-text mb-4">발송 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-sub">전체 수신자</span>
                <span className="font-medium text-text">{recipients.length}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-sub">발송 대상</span>
                <span className="font-medium text-green-600">{agreedRecipients.length}명</span>
              </div>
              {notAgreedCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-sub">미동의 제외</span>
                  <span className="font-medium text-yellow-600">{notAgreedCount}명</span>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!body.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface text-text text-sm font-medium rounded-xl hover:bg-border-light transition-colors disabled:opacity-50"
              >
                <Eye size={16} />
                미리보기
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || agreedRecipients.length === 0 || !subject.trim() || !body.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                {isSending ? "발송 중..." : "이메일 발송"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">이메일 미리보기</h3>
              <button onClick={() => setShowPreview(false)} className="p-1 text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-3 pb-3 border-b border-border-light">
                <p className="text-xs text-text-muted">제목</p>
                <p className="text-sm font-medium text-text">{subject}</p>
              </div>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: previewBody(body, agreedRecipients[0]),
                }}
              />
              <div className="mt-6 pt-4 border-t border-border-light text-center">
                <p className="text-xs text-text-muted">
                  KECA 한국교육컨설팅협회 | kecamanager@gmail.com
                </p>
                <p className="text-xs text-text-muted mt-1">
                  <span className="underline">수신 거부</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
