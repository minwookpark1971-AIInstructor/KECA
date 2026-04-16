"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, AlertTriangle, Send, X, Info, Link2, Plus, Trash2, Image as ImageIcon, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Profile, MarketingTemplate } from "@/types";

type MessageType = "alimtalk" | "brand_message";

interface LinkButton {
  name: string;
  url: string;
  type: "web" | "video" | "blog";
}

interface OgData {
  title: string;
  description: string;
  image: string;
}

interface Props {
  templates: MarketingTemplate[];
}

export default function KakaoComposeClient({ templates }: Props) {
  const [recipients, setRecipients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState<MessageType>("alimtalk");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Link buttons
  const [buttons, setButtons] = useState<LinkButton[]>([]);
  const [showAddButton, setShowAddButton] = useState(false);
  const [newButtonName, setNewButtonName] = useState("");
  const [newButtonUrl, setNewButtonUrl] = useState("");
  const [newButtonType, setNewButtonType] = useState<"web" | "video" | "blog">("web");
  const [ogData, setOgData] = useState<Record<string, OgData>>({});
  const [ogLoading, setOgLoading] = useState<Set<number>>(new Set());
  const ogDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image upload (brand_message only)
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    fetch("/api/marketing/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_recipients", ids }),
    })
      .then((res) => res.json())
      .then((data) => setRecipients(data.recipients || []))
      .catch(() => setMsg({ type: "error", text: "수신자 정보를 불러오지 못했습니다." }))
      .finally(() => setLoading(false));
  }, []);

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  // 연락처 있는 회원만 필터
  const validRecipients = recipients.filter((r) => r.phone);
  const noPhoneCount = recipients.length - validRecipients.length;

  // 카카오 동의 필터
  const agreedRecipients = validRecipients.filter((r) => r.marketing_kakao_agreed);
  const notAgreedCount = validRecipients.length - agreedRecipients.length;

  // OG metadata fetch (debounced)
  const fetchOgData = useCallback((url: string, index: number) => {
    if (!url) return;
    try {
      new URL(url);
    } catch {
      return;
    }

    setOgLoading((prev) => new Set(prev).add(index));
    fetch(`/api/og-metadata?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.title || data.description || data.image) {
          setOgData((prev) => ({ ...prev, [url]: data }));
        }
      })
      .catch(() => {})
      .finally(() => {
        setOgLoading((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      });
  }, []);

  const handleNewButtonUrlChange = (url: string) => {
    setNewButtonUrl(url);
    if (ogDebounceRef.current) clearTimeout(ogDebounceRef.current);
    ogDebounceRef.current = setTimeout(() => {
      fetchOgData(url, -1);
    }, 800);
  };

  const handleAddButton = () => {
    if (!newButtonName.trim() || !newButtonUrl.trim()) return;
    if (buttons.length >= 5) return;
    setButtons((prev) => [...prev, { name: newButtonName.trim(), url: newButtonUrl.trim(), type: newButtonType }]);
    // Fetch OG for the newly added button
    fetchOgData(newButtonUrl.trim(), buttons.length);
    setNewButtonName("");
    setNewButtonUrl("");
    setNewButtonType("web");
    setShowAddButton(false);
  };

  const removeButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "marketing");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "업로드 실패");
      setImageUrl(data.url);
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "이미지 업로드에 실패했습니다." });
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      setMsg({ type: "error", text: "메시지를 입력해주세요." });
      return;
    }

    const target = messageType === "alimtalk" ? validRecipients : agreedRecipients;
    if (target.length === 0) {
      setMsg({ type: "error", text: "발송 가능한 수신자가 없습니다." });
      return;
    }

    // 알림톡은 검수 통과한 템플릿 코드가 필수
    const selectedTpl = templates.find((t) => t.id === selectedTemplateId);
    const templateCode = selectedTpl?.kakao_template_code;
    if (messageType === "alimtalk" && !templateCode) {
      setMsg({
        type: "error",
        text: "알림톡은 솔라피에 등록·승인된 템플릿을 선택해야 합니다.",
      });
      return;
    }

    if (!confirm(`${target.length}명에게 카카오톡 메시지를 발송하시겠습니까?`)) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/marketing/send-kakao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientIds: target.map((r) => r.id),
          messageType,
          message,
          buttons: buttons.length > 0 ? buttons : undefined,
          imageUrl: imageUrl || undefined,
          templateCode: templateCode || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "발송 실패");

      setMsg({ type: "success", text: `${result.successCount || 0}명에게 메시지가 발송되었습니다.` });
      sessionStorage.removeItem("marketing_recipients");
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "발송에 실패했습니다." });
    } finally {
      setIsSending(false);
    }
  };

  const buttonTypeBadge = (type: string) => {
    switch (type) {
      case "video": return { label: "동영상", cls: "bg-red-50 text-red-600" };
      case "blog": return { label: "블로그", cls: "bg-green-50 text-green-600" };
      default: return { label: "일반", cls: "bg-blue-50 text-blue-600" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/marketing" className="p-1.5 rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} className="text-text-sub" />
        </Link>
        <h1 className="text-2xl font-bold text-text">카카오톡 발송</h1>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* 2026년 정책 안내 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex gap-2">
          <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-medium">2026년 카카오 비즈메시지 정책 안내</p>
            <p>알림톡: 계약/거래에 직접 관련된 정보성 메시지만 가능 (광고 문구 포함 시 반려)</p>
            <p>브랜드 메시지: 채널 친구에게만 발송, 야간(21:00~08:00) 발송 불가</p>
            <p>발송은 공식 딜러사(솔라피/비즈톡 등)를 통해 처리됩니다.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 작성 폼 */}
        <div className="lg:col-span-2 space-y-5">
          {/* 발송 유형 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <p className="text-sm font-medium text-text mb-3">발송 유형</p>
            <div className="flex gap-3">
              <label className={`flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${messageType === "alimtalk" ? "border-primary bg-primary/5" : "border-border-light hover:bg-surface"}`}>
                <input type="radio" name="type" value="alimtalk" checked={messageType === "alimtalk"} onChange={() => setMessageType("alimtalk")} className="hidden" />
                <p className="text-sm font-medium text-text">알림톡</p>
                <p className="text-xs text-text-muted mt-0.5">정보성 메시지 (템플릿 기반)</p>
              </label>
              <label className={`flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${messageType === "brand_message" ? "border-yellow-500 bg-yellow-50" : "border-border-light hover:bg-surface"}`}>
                <input type="radio" name="type" value="brand_message" checked={messageType === "brand_message"} onChange={() => setMessageType("brand_message")} className="hidden" />
                <p className="text-sm font-medium text-text">브랜드 메시지</p>
                <p className="text-xs text-text-muted mt-0.5">광고/홍보 메시지 (자유 형식)</p>
              </label>
            </div>
          </div>

          {/* 수신자 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <p className="text-sm font-medium text-text mb-3">수신자 ({recipients.length}명)</p>
            {noPhoneCount > 0 && (
              <div className="flex items-center gap-2 mb-3 p-2.5 bg-red-50 rounded-lg">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-xs text-red-600">{noPhoneCount}명의 연락처가 없어 발송 대상에서 제외됩니다.</span>
              </div>
            )}
            {messageType === "brand_message" && notAgreedCount > 0 && (
              <div className="flex items-center gap-2 mb-3 p-2.5 bg-yellow-50 rounded-lg">
                <AlertTriangle size={14} className="text-yellow-600" />
                <span className="text-xs text-yellow-700">{notAgreedCount}명이 카카오톡 수신에 동의하지 않아 제외됩니다.</span>
              </div>
            )}
            {recipients.length === 0 ? (
              <p className="text-sm text-text-muted">회원관리에서 회원을 선택한 후 &quot;카카오톡 발송&quot; 버튼을 눌러주세요.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {recipients.map((r) => (
                  <span key={r.id} className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${r.phone ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-400 line-through"}`}>
                    {r.name} {r.phone ? `(${r.phone})` : "(연락처 없음)"}
                    <button onClick={() => removeRecipient(r.id)} className="hover:text-error"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 템플릿 선택 */}
          {(() => {
            const filteredTemplates = templates.filter(
              (t) => t.channel === "kakao" && (messageType === "alimtalk" ? t.type === "alimtalk" : t.type === "brand_message")
            );
            return filteredTemplates.length > 0 ? (
              <div className="bg-white border border-border-light rounded-xl p-5">
                <p className="text-sm font-medium text-text mb-2">템플릿 선택 (선택사항)</p>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    const tpl = templates.find((t) => t.id === e.target.value);
                    if (tpl) setMessage(tpl.body);
                  }}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">직접 작성</option>
                  {filteredTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}{t.kakao_template_code ? ` (${t.kakao_template_code})` : ""}</option>
                  ))}
                </select>
                {selectedTemplateId && (() => {
                  const selected = templates.find((t) => t.id === selectedTemplateId);
                  return selected?.kakao_template_code ? (
                    <p className="mt-2 text-xs text-text-muted bg-surface rounded-lg px-3 py-2">
                      템플릿 코드: <span className="font-mono font-medium">{selected.kakao_template_code}</span>
                    </p>
                  ) : null;
                })()}
              </div>
            ) : null;
          })()}

          {/* 메시지 작성 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-text">
                {messageType === "alimtalk" ? "메시지 내용 (템플릿)" : "메시지 내용"}
              </p>
              <p className="text-xs text-text-muted">변수: {"#{이름}"}, {"#{연락처}"}</p>
            </div>
            {messageType === "alimtalk" && (
              <div className="mb-3 p-2.5 bg-surface rounded-lg">
                <p className="text-xs text-text-muted">
                  알림톡은 카카오 검수를 통과한 템플릿만 사용 가능합니다. 딜러사 대시보드에서 템플릿을 등록하고 승인받은 후 사용하세요.
                </p>
              </div>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder={messageType === "alimtalk"
                ? "[KECA] #{이름}님, 교육 일정 안내\n\n교육명: OO 과정\n일시: 2026-00-00 10:00\n장소: OOO\n\n자세한 내용은 홈페이지를 확인해주세요."
                : "[KECA] 신규 교육 프로그램 안내\n\n안녕하세요, #{이름}님!\n\nKECA에서 새로운 교육 프로그램을 준비했습니다.\n\n자세한 내용 확인하기 >"}
              className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>

          {/* 링크 버튼 */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-text-sub" />
                <p className="text-sm font-medium text-text">링크 버튼 ({buttons.length}/5)</p>
              </div>
              {buttons.length < 5 && (
                <button
                  onClick={() => setShowAddButton(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Plus size={12} />
                  링크 버튼 추가
                </button>
              )}
            </div>

            {/* Existing buttons */}
            {buttons.length > 0 && (
              <div className="space-y-3 mb-3">
                {buttons.map((btn, idx) => {
                  const badge = buttonTypeBadge(btn.type);
                  const og = ogData[btn.url];
                  return (
                    <div key={idx} className="border border-border-light rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-text">{btn.name}</span>
                            <span className={`px-1.5 py-0.5 text-xs rounded ${badge.cls}`}>{badge.label}</span>
                          </div>
                          <a href={btn.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate max-w-xs">
                            {btn.url}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                        <button onClick={() => removeButton(idx)} className="p-1 text-text-muted hover:text-error rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* OG Preview */}
                      {ogLoading.has(idx) ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                          <Loader2 size={12} className="animate-spin" />
                          미리보기 로딩 중...
                        </div>
                      ) : og ? (
                        <div className="mt-2 flex gap-2 p-2 bg-surface rounded-lg">
                          {og.image && (
                            <img src={og.image} alt="" className="w-16 h-16 object-cover rounded shrink-0" />
                          )}
                          <div className="min-w-0">
                            {og.title && <p className="text-xs font-medium text-text truncate">{og.title}</p>}
                            {og.description && <p className="text-xs text-text-muted line-clamp-2">{og.description}</p>}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add button form */}
            {showAddButton && (
              <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-sub">버튼 이름</label>
                  <input
                    value={newButtonName}
                    onChange={(e) => setNewButtonName(e.target.value)}
                    placeholder="예: 자세히 보기"
                    className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-sub">URL</label>
                  <input
                    value={newButtonUrl}
                    onChange={(e) => handleNewButtonUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-sub">유형</label>
                  <select
                    value={newButtonType}
                    onChange={(e) => setNewButtonType(e.target.value as "web" | "video" | "blog")}
                    className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="web">일반</option>
                    <option value="video">동영상</option>
                    <option value="blog">블로그</option>
                  </select>
                </div>

                {/* OG Preview for new button */}
                {ogLoading.has(-1) ? (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Loader2 size={12} className="animate-spin" />
                    미리보기 로딩 중...
                  </div>
                ) : ogData[newButtonUrl] ? (
                  <div className="flex gap-2 p-2 bg-surface rounded-lg">
                    {ogData[newButtonUrl].image && (
                      <img src={ogData[newButtonUrl].image} alt="" className="w-16 h-16 object-cover rounded shrink-0" />
                    )}
                    <div className="min-w-0">
                      {ogData[newButtonUrl].title && <p className="text-xs font-medium text-text truncate">{ogData[newButtonUrl].title}</p>}
                      {ogData[newButtonUrl].description && <p className="text-xs text-text-muted line-clamp-2">{ogData[newButtonUrl].description}</p>}
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <button onClick={() => setShowAddButton(false)} className="flex-1 px-3 py-2 text-sm text-text-sub bg-surface rounded-lg hover:bg-border-light">취소</button>
                  <button onClick={handleAddButton} disabled={!newButtonName.trim() || !newButtonUrl.trim()} className="flex-1 px-3 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50">추가</button>
                </div>
              </div>
            )}

            {buttons.length === 0 && !showAddButton && (
              <p className="text-xs text-text-muted">링크 버튼을 추가하면 메시지에 클릭 가능한 버튼이 포함됩니다.</p>
            )}
          </div>

          {/* 이미지 첨부 (브랜드 메시지만) */}
          {messageType === "brand_message" && (
            <div className="bg-white border border-border-light rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-text-sub" />
                <p className="text-sm font-medium text-text">이미지 첨부</p>
              </div>

              {imageUrl ? (
                <div className="relative inline-block">
                  <img src={imageUrl} alt="첨부 이미지" className="w-48 h-32 object-cover rounded-lg border border-border-light" />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-text-sub hover:bg-surface transition-colors disabled:opacity-50"
                  >
                    {imageUploading ? (
                      <><Loader2 size={14} className="animate-spin" /> 업로드 중...</>
                    ) : (
                      <><ImageIcon size={14} /> 이미지 선택</>
                    )}
                  </button>
                  <p className="text-xs text-text-muted mt-1.5">JPG, PNG 등 이미지 파일 (권장 크기: 800x400px)</p>
                </div>
              )}
            </div>
          )}
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
                <span className="text-text-sub">연락처 보유</span>
                <span className="font-medium text-text">{validRecipients.length}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-sub">발송 대상</span>
                <span className="font-medium text-green-600">
                  {messageType === "alimtalk" ? validRecipients.length : agreedRecipients.length}명
                </span>
              </div>
              {buttons.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-sub">링크 버튼</span>
                  <span className="font-medium text-text">{buttons.length}개</span>
                </div>
              )}
              {imageUrl && (
                <div className="flex justify-between">
                  <span className="text-text-sub">이미지</span>
                  <span className="font-medium text-green-600">첨부됨</span>
                </div>
              )}
            </div>

            <div className="mt-5">
              {(() => {
                const selectedTpl = templates.find((t) => t.id === selectedTemplateId);
                const needsTemplate = messageType === "alimtalk" && !selectedTpl?.kakao_template_code;
                return (
                  <>
                    <button
                      onClick={handleSend}
                      disabled={
                        isSending ||
                        (messageType === "alimtalk" ? validRecipients.length === 0 : agreedRecipients.length === 0) ||
                        !message.trim() ||
                        needsTemplate
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50"
                    >
                      <Send size={16} />
                      {isSending ? "발송 중..." : "카카오톡 발송"}
                    </button>
                    {needsTemplate && (
                      <p className="mt-2 text-xs text-yellow-700">
                        알림톡 발송에는 솔라피에 등록된 템플릿 선택이 필요합니다.
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* 테스트 발송 */}
            <button
              onClick={async () => {
                const testPhone = prompt("테스트 수신 번호를 입력하세요 (예: 010-1234-5678)");
                if (!testPhone || !message.trim()) return;

                // 알림톡은 검수 통과한 템플릿 코드가 필수
                const selectedTpl = templates.find((t) => t.id === selectedTemplateId);
                const templateCode = selectedTpl?.kakao_template_code;
                if (messageType === "alimtalk" && !templateCode) {
                  setMsg({
                    type: "error",
                    text: "알림톡 테스트 발송은 등록된 템플릿을 선택해야 합니다.",
                  });
                  return;
                }

                setIsSending(true);
                try {
                  const res = await fetch("/api/marketing/send-kakao", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      recipientIds: [],
                      messageType,
                      message,
                      buttons: buttons.length > 0 ? buttons : undefined,
                      imageUrl: imageUrl || undefined,
                      templateCode: templateCode || undefined,
                      testPhone,
                    }),
                  });
                  const result = await res.json();
                  setMsg({ type: result.error ? "error" : "success", text: result.error || "테스트 발송이 요청되었습니다." });
                } catch {
                  setMsg({ type: "error", text: "테스트 발송에 실패했습니다." });
                } finally {
                  setIsSending(false);
                }
              }}
              disabled={isSending || !message.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface text-text-sub text-xs font-medium rounded-xl hover:bg-border-light transition-colors disabled:opacity-50 mt-2"
            >
              테스트 발송 (1건)
            </button>

            <div className="mt-4 p-3 bg-surface rounded-lg">
              <p className="text-xs text-text-muted">
                {messageType === "alimtalk"
                  ? "알림톡은 수신 동의 없이 발송 가능하지만, 계약/거래 관련 정보만 허용됩니다."
                  : "브랜드 메시지는 카카오톡 채널 친구이며 수신 동의한 회원에게만 발송됩니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
