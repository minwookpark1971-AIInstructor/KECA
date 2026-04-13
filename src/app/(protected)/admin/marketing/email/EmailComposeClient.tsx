"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send, Eye, X, AlertTriangle, ArrowLeft, UserPlus, Search, Users, GraduationCap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { roleLabels } from "@/lib/utils";
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

  // 수신자 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [allMembers, setAllMembers] = useState<Profile[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalFilter, setModalFilter] = useState("all");
  const [modalSelected, setModalSelected] = useState<Set<string>>(new Set());

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

    // POST로 수신자 프로필 조회
    fetch("/api/marketing/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_recipients", ids }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRecipients(data.recipients || []);
        sessionStorage.removeItem("marketing_recipients");
      })
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

  // 수신자 추가 모달 열기
  const openAddModal = async () => {
    setShowAddModal(true);
    setModalSearch("");
    setModalFilter("all");
    // 이미 추가된 수신자는 체크 상태로 표시
    setModalSelected(new Set(recipients.map((r) => r.id)));

    if (allMembers.length === 0) {
      setMembersLoading(true);
      try {
        const res = await fetch("/api/marketing/send-email");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAllMembers(data.members || []);
      } catch (err) {
        console.error("회원 목록 로드 실패:", err);
        setMsg({ type: "error", text: "회원 목록을 불러오지 못했습니다. 페이지를 새로고침해주세요." });
      } finally {
        setMembersLoading(false);
      }
    } else {
      setModalSelected(new Set(recipients.map((r) => r.id)));
    }
  };

  // 모달 필터링
  const filteredModalMembers = useMemo(() => {
    return allMembers.filter((m) => {
      if (modalFilter === "instructor" && !m.is_instructor) return false;
      if (modalFilter !== "all" && modalFilter !== "instructor" && m.role !== modalFilter) return false;
      if (modalSearch && !m.name.includes(modalSearch) && !m.email.includes(modalSearch)) return false;
      return true;
    });
  }, [allMembers, modalFilter, modalSearch]);

  const toggleModalSelect = (id: string) => {
    setModalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isModalAllSelected = filteredModalMembers.length > 0 && filteredModalMembers.every((m) => modalSelected.has(m.id));
  const toggleModalSelectAll = () => {
    if (isModalAllSelected) {
      const filteredIds = new Set(filteredModalMembers.map((m) => m.id));
      setModalSelected((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setModalSelected((prev) => {
        const next = new Set(prev);
        filteredModalMembers.forEach((m) => next.add(m.id));
        return next;
      });
    }
  };

  // 모달에서 수신자 확정
  const confirmAddRecipients = () => {
    const selectedMembers = allMembers.filter((m) => modalSelected.has(m.id));
    setRecipients(selectedMembers);
    setShowAddModal(false);
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text">수신자 ({recipients.length}명)</p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
              >
                <UserPlus size={13} />
                수신자 추가
              </button>
            </div>
            {notAgreedCount > 0 && (
              <div className="flex items-center gap-2 mb-3 p-2.5 bg-yellow-50 rounded-lg">
                <AlertTriangle size={14} className="text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  {notAgreedCount}명이 이메일 수신에 동의하지 않아 발송 대상에서 제외됩니다.
                </span>
              </div>
            )}
            {recipients.length === 0 ? (
              <div className="text-center py-8 bg-surface/50 rounded-xl border border-dashed border-border">
                <Users size={32} className="mx-auto text-text-muted mb-3" />
                <p className="text-sm text-text-sub mb-1">수신자를 선택해주세요</p>
                <p className="text-xs text-text-muted mb-4">회원 목록에서 개별 또는 그룹(정회원/준회원/강사)으로 선택할 수 있습니다.</p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <UserPlus size={16} />
                  수신자 선택
                </button>
              </div>
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
            <div className="text-sm text-text-sub space-y-1">
              <p>발신: <span className="font-medium text-text">KECA 한국교육컨설팅협회</span> &lt;noreply@keca.or.kr&gt;</p>
              <p>답장: <span className="font-medium text-text">kecamanager@gmail.com</span></p>
            </div>
            <p className="text-xs text-text-muted mt-2">수신자가 답장하면 kecamanager@gmail.com으로 수신됩니다.</p>
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

      {/* 수신자 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-light shrink-0">
              <h3 className="text-lg font-bold text-text">수신자 선택</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            {/* 그룹 빠른 선택 + 필터 + 검색 */}
            <div className="px-5 pt-4 pb-3 space-y-3 shrink-0">
              {/* 그룹 빠른 선택 */}
              {!membersLoading && allMembers.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-2">그룹 선택</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      {
                        label: "정회원",
                        icon: Users,
                        color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
                        filter: (m: Profile) => m.role === "member",
                      },
                      {
                        label: "준회원",
                        icon: Users,
                        color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
                        filter: (m: Profile) => m.role === "associate",
                      },
                      {
                        label: "강사",
                        icon: GraduationCap,
                        color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
                        filter: (m: Profile) => m.is_instructor,
                      },
                    ].map((group) => {
                      const groupMembers = allMembers.filter(group.filter);
                      const allGroupSelected = groupMembers.length > 0 && groupMembers.every((m) => modalSelected.has(m.id));
                      return (
                        <button
                          key={group.label}
                          onClick={() => {
                            setModalSelected((prev) => {
                              const next = new Set(prev);
                              if (allGroupSelected) {
                                groupMembers.forEach((m) => next.delete(m.id));
                              } else {
                                groupMembers.forEach((m) => next.add(m.id));
                              }
                              return next;
                            });
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                            allGroupSelected
                              ? "bg-primary text-white border-primary"
                              : group.color
                          )}
                        >
                          <group.icon size={13} />
                          {group.label} ({groupMembers.length})
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        const allSelected = allMembers.length > 0 && allMembers.every((m) => modalSelected.has(m.id));
                        if (allSelected) {
                          setModalSelected(new Set());
                        } else {
                          setModalSelected(new Set(allMembers.map((m) => m.id)));
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                        allMembers.length > 0 && allMembers.every((m) => modalSelected.has(m.id))
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Mail size={13} />
                      전체 ({allMembers.length})
                    </button>
                  </div>
                </div>
              )}

              {/* 필터 탭 */}
              <div className="flex gap-1 bg-surface border border-border-light rounded-lg p-1 flex-wrap">
                {[
                  { key: "all", label: "전체" },
                  { key: "approved", label: "승인완료" },
                  { key: "associate", label: "준회원" },
                  { key: "member", label: "정회원" },
                  { key: "instructor", label: "강사" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setModalFilter(f.key)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                      modalFilter === f.key ? "bg-primary text-white" : "text-text-sub hover:bg-white"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* 검색 */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="이름 또는 이메일 검색"
                  className="w-full pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* 회원 목록 */}
            <div className="flex-1 overflow-y-auto px-5">
              {membersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-border-light text-text-sub">
                      <th className="text-center px-2 py-2 w-10">
                        <input
                          type="checkbox"
                          checked={isModalAllSelected}
                          onChange={toggleModalSelectAll}
                          className="rounded border-border text-primary focus:ring-primary/20"
                        />
                      </th>
                      <th className="text-left px-3 py-2 font-medium">이름</th>
                      <th className="text-left px-3 py-2 font-medium">이메일</th>
                      <th className="text-center px-3 py-2 font-medium">상태</th>
                      <th className="text-center px-3 py-2 font-medium">수신동의</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {filteredModalMembers.map((m) => (
                      <tr
                        key={m.id}
                        className={cn("hover:bg-surface/50 cursor-pointer", modalSelected.has(m.id) && "bg-primary/5")}
                        onClick={() => toggleModalSelect(m.id)}
                      >
                        <td className="text-center px-2 py-2">
                          <input
                            type="checkbox"
                            checked={modalSelected.has(m.id)}
                            onChange={() => toggleModalSelect(m.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-border text-primary focus:ring-primary/20"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-text">{m.name}</td>
                        <td className="px-3 py-2 text-text-sub text-xs">{m.email}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-xs text-text-muted">{roleLabels[m.role] || m.role}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-xs ${m.marketing_email_agreed ? "text-green-600" : "text-gray-400"}`}>
                            {m.marketing_email_agreed ? "동의" : "미동의"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!membersLoading && filteredModalMembers.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">검색 결과가 없습니다.</p>
              )}
            </div>

            {/* 하단 확인 */}
            <div className="flex items-center justify-between p-5 border-t border-border-light shrink-0">
              <span className="text-sm text-text-sub">
                <span className="text-primary font-bold">{modalSelected.size}</span>명 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmAddRecipients}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
                >
                  수신자 적용
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
