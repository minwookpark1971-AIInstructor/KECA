"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ArrowLeft, AlertTriangle, Send, X, Info, Link2, Plus, Trash2,
  Image as ImageIcon, ExternalLink, Loader2, UserPlus, Search,
  Users, GraduationCap, Phone, Upload, Lock, FileText, RefreshCw,
  ChevronDown, MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { cn, roleLabels } from "@/lib/utils";
import type { Profile, MarketingTemplate, MarketingGroup } from "@/types";
import * as XLSX from "xlsx";

type MessageType = "alimtalk" | "brand_message";
type BrandMessageType = "text" | "image";

// 자동 매핑되는 개인화 변수명 (수신자 프로필에서 채움 — UI 입력 불필요)
const PERSONAL_VAR_NAMES = new Set([
  "이름", "회원명", "성명", "name",
  "연락처", "휴대폰", "전화번호", "phone",
]);

// "구글폼/외부 URL 단축" 역할 변수명 — 이 변수는 URL 입력 후 발송 시 code로 자동 변환
const REDIRECT_VAR_NAMES = new Set([
  "code", "신청코드", "applyCode", "신청링크", "링크",
]);

// 템플릿 본문에서 변수명 추출 (#{name} 제거하고 name만 반환, 중복 제거)
function getRawVarNames(text: string): string[] {
  const matches = text.match(/#\{([^}]+)\}/g) || [];
  return [...new Set(matches.map((m) => m.slice(2, -1)))];
}

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
  const [templateCode, setTemplateCode] = useState("");
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

  // Brand message specific
  const [brandMessageType, setBrandMessageType] = useState<BrandMessageType>("text");
  const [isAdMessage, setIsAdMessage] = useState(true);
  const [unsubscribeNumber, setUnsubscribeNumber] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 발송 확인 모달 (confirm 대체)
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  // 수신자 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [allMembers, setAllMembers] = useState<Profile[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalFilter, setModalFilter] = useState("all");
  const [modalSelected, setModalSelected] = useState<Set<string>>(new Set());

  // 수신 그룹
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [groups, setGroups] = useState<MarketingGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // 엑셀 업로드
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // 템플릿 선택 모달
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<"all" | "alimtalk" | "brand_message">("all");
  const [templateStatusFilter, setTemplateStatusFilter] = useState<"all" | "approved" | "pending_review" | "rejected">("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<MarketingTemplate | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 알림톡 템플릿 공통 변수 값 (관리자가 입력; 모든 수신자에게 동일하게 전송)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  // 알림톡 템플릿의 WL 버튼별 URL (buttonName 기준)
  const [templateButtonUrls, setTemplateButtonUrls] = useState<
    Record<string, { linkMo: string; linkPc?: string }>
  >({});
  // "구글폼/외부 URL 단축" 역할 변수별 입력값 (변수명 → 실제 외부 URL)
  const [redirectUrls, setRedirectUrls] = useState<Record<string, string>>({});

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

  // 연락처 있는 회원만 필터
  const validRecipients = recipients.filter((r) => r.phone);
  const noPhoneCount = recipients.length - validRecipients.length;

  // 카카오 동의 필터
  const agreedRecipients = validRecipients.filter((r) => r.marketing_kakao_agreed);
  const notAgreedCount = validRecipients.length - agreedRecipients.length;

  // 발송 대상
  const sendTargets = messageType === "alimtalk" ? validRecipients : agreedRecipients;

  // 글자 수 제한
  const maxChars = messageType === "brand_message" ? (brandMessageType === "image" ? 400 : 1300) : 0;

  // ─── 수신자 모달 ───

  const openAddModal = async () => {
    setShowAddModal(true);
    setModalSearch("");
    setModalFilter("all");
    setModalSelected(new Set(recipients.map((r) => r.id)));

    if (allMembers.length === 0) {
      setMembersLoading(true);
      try {
        const res = await fetch("/api/marketing/send-email");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAllMembers(data.members || []);
      } catch {
        setMsg({ type: "error", text: "회원 목록을 불러오지 못했습니다." });
      } finally {
        setMembersLoading(false);
      }
    } else {
      setModalSelected(new Set(recipients.map((r) => r.id)));
    }
  };

  const filteredModalMembers = useMemo(() => {
    return allMembers.filter((m) => {
      if (modalFilter === "instructor" && !m.is_instructor) return false;
      if (modalFilter !== "all" && modalFilter !== "instructor" && m.role !== modalFilter) return false;
      if (modalSearch) {
        const q = modalSearch.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q) &&
          !(m.phone && m.phone.includes(modalSearch))
        )
          return false;
      }
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

  const isModalAllSelected =
    filteredModalMembers.length > 0 && filteredModalMembers.every((m) => modalSelected.has(m.id));
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

  const confirmAddRecipients = () => {
    const selectedMembers = allMembers.filter((m) => modalSelected.has(m.id));
    setRecipients(selectedMembers);
    setShowAddModal(false);
  };

  // ─── 수신 그룹 연동 ───

  const loadGroups = async () => {
    if (groups.length > 0) {
      setShowGroupDropdown(true);
      return;
    }
    setGroupsLoading(true);
    setShowGroupDropdown(true);
    try {
      const res = await fetch("/api/marketing/groups");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch {
      setMsg({ type: "error", text: "수신 그룹 목록을 불러오지 못했습니다." });
    } finally {
      setGroupsLoading(false);
    }
  };

  const loadGroupMembers = async (group: MarketingGroup) => {
    setShowGroupDropdown(false);
    if (!group.member_ids || group.member_ids.length === 0) {
      setMsg({ type: "error", text: "해당 그룹에 회원이 없습니다." });
      return;
    }
    try {
      const res = await fetch("/api/marketing/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_recipients", ids: group.member_ids }),
      });
      const data = await res.json();
      const newMembers: Profile[] = data.recipients || [];
      setRecipients((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const unique = newMembers.filter((m) => !existingIds.has(m.id));
        return [...prev, ...unique];
      });
      setMsg({ type: "success", text: `"${group.name}" 그룹에서 ${newMembers.length}명이 추가되었습니다.` });
    } catch {
      setMsg({ type: "error", text: "그룹 회원을 불러오지 못했습니다." });
    }
  };

  // ─── 엑셀 업로드 ───

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

        const existingPhones = new Set(recipients.map((r) => r.phone).filter(Boolean));
        let added = 0;
        let duplicated = 0;
        const newRecipients: Profile[] = [];

        for (const row of rows) {
          const phone = (row["수신번호"] || row["연락처"] || row["phone"] || row["Phone"] || "")
            .toString()
            .replace(/[-\s()]/g, "");
          if (!phone) continue;

          if (existingPhones.has(phone)) {
            duplicated++;
            continue;
          }

          existingPhones.add(phone);
          const name = (row["이름"] || row["name"] || row["Name"] || "외부수신자").toString();
          newRecipients.push({
            id: `excel_${Date.now()}_${added}`,
            email: "",
            name,
            phone,
            role: "approved",
            is_instructor: false,
            marketing_kakao_agreed: true,
          } as Profile);
          added++;
        }

        setRecipients((prev) => [...prev, ...newRecipients]);
        setMsg({
          type: "success",
          text: `${added}건 추가${duplicated > 0 ? `, ${duplicated}건 중복 제외` : ""}`,
        });
      } catch {
        setMsg({ type: "error", text: "엑셀 파일 파싱에 실패했습니다." });
      }
      setShowExcelUpload(false);
    };
    reader.readAsBinaryString(file);
    if (excelInputRef.current) excelInputRef.current.value = "";
  };

  // ─── 템플릿 관련 ───

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (t.channel !== "kakao") return false;
      if (templateFilter !== "all" && t.type !== templateFilter) return false;
      if (templateStatusFilter !== "all" && t.kakao_status !== templateStatusFilter) return false;
      if (templateSearch && !t.name.toLowerCase().includes(templateSearch.toLowerCase())) return false;
      return true;
    });
  }, [templates, templateFilter, templateStatusFilter, templateSearch]);

  const applyTemplate = (template: MarketingTemplate) => {
    setSelectedTemplateId(template.id);
    setMessage(template.body);
    setTemplateCode(template.kakao_template_code || "");
    if (template.type === "alimtalk" || template.type === "brand_message") {
      setMessageType(template.type);
    }
    // 알림톡: 승인 템플릿 구조 유지 — UI에서 추가된 버튼을 제거 (카카오 3036 방지)
    if (template.type === "alimtalk") {
      setButtons([]);
      setShowAddButton(false);
      // 템플릿 링크 버튼(WL)의 URL 기본값 세팅
      const btnUrls: Record<string, { linkMo: string; linkPc?: string }> = {};
      for (const btn of template.kakao_buttons || []) {
        if (btn.buttonType === "WL") {
          btnUrls[btn.buttonName] = {
            linkMo: btn.linkMo || "",
            linkPc: btn.linkPc || undefined,
          };
        }
      }
      setTemplateButtonUrls(btnUrls);
    } else {
      setTemplateButtonUrls({});
    }
    // 템플릿 본문 + 버튼 URL에서 모두 변수 추출 → 변수명 분류
    // 버튼 URL에도 #{변수}가 있을 수 있음 (예: https://keca.vercel.app/apply/#{code})
    const bodyVars = getRawVarNames(template.body);
    const buttonVars = (template.kakao_buttons || []).flatMap((b) => [
      ...(b.linkMo ? getRawVarNames(b.linkMo) : []),
      ...(b.linkPc ? getRawVarNames(b.linkPc) : []),
    ]);
    const allVars = [...new Set([...bodyVars, ...buttonVars])];

    const nextVars: Record<string, string> = {};
    const nextRedirects: Record<string, string> = {};
    for (const v of allVars) {
      if (PERSONAL_VAR_NAMES.has(v)) continue;
      if (REDIRECT_VAR_NAMES.has(v)) {
        nextRedirects[v] = "";
      } else {
        nextVars[v] = "";
      }
    }
    setTemplateVariables(nextVars);
    setRedirectUrls(nextRedirects);
    setShowTemplateModal(false);
    setPreviewTemplate(null);
  };

  const clearTemplate = () => {
    setSelectedTemplateId("");
    setTemplateCode("");
    setMessage("");
    setTemplateVariables({});
    setTemplateButtonUrls({});
    setRedirectUrls({});
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleSyncTemplates = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/marketing/kakao-templates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: data.message || `${data.synced}개 템플릿 동기화 완료` });
      window.location.reload();
    } catch {
      setMsg({ type: "error", text: "템플릿 동기화에 실패했습니다." });
    } finally {
      setIsSyncing(false);
    }
  };

  const renderWithHighlightedVars = (text: string) => {
    return text.split(/(#\{[^}]+\})/g).map((part, i) =>
      part.startsWith("#{") ? (
        <span
          key={i}
          className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono font-medium"
        >
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const getTemplateVars = (text: string) => {
    const matches = text.match(/#\{[^}]+\}/g);
    return matches ? [...new Set(matches)] : [];
  };

  // ─── 변수 삽입 ───

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + variable + message.slice(end);
    setMessage(newMessage);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  // ─── OG metadata ───

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
    fetchOgData(newButtonUrl.trim(), buttons.length);
    setNewButtonName("");
    setNewButtonUrl("");
    setNewButtonType("web");
    setShowAddButton(false);
  };

  const removeButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Image upload ───

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

  // ─── 발송 ───

  // 리다이렉트 변수가 있으면 각각 /api/apply-redirects로 code를 발급받아 variables에 병합
  const resolveRedirectVariables = useCallback(async (): Promise<Record<string, string>> => {
    const merged: Record<string, string> = { ...templateVariables };
    const entries = Object.entries(redirectUrls);
    if (entries.length === 0) return merged;

    const tpl = templates.find((t) => t.id === selectedTemplateId);
    const labelPrefix = tpl?.name || "알림톡";

    for (const [varName, rawUrl] of entries) {
      const url = rawUrl.trim();
      if (!url) continue;
      const res = await fetch("/api/apply-redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_url: url, label: `${labelPrefix} · #{${varName}}` }),
      });
      const data = await res.json();
      if (!res.ok || !data.code) {
        throw new Error(data.error || "단축 링크 생성 실패");
      }
      merged[varName] = data.code;
    }
    return merged;
  }, [templateVariables, redirectUrls, templates, selectedTemplateId]);

  // 알림톡 발송용 버튼 배열 구성 (템플릿 구조 + 관리자 입력 URL)
  const buildAlimtalkButtons = useCallback(() => {
    if (messageType !== "alimtalk" || !selectedTemplateId) return undefined;
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl?.kakao_buttons?.length) return undefined;
    return tpl.kakao_buttons.map((btn) => {
      if (btn.buttonType === "WL") {
        const urls = templateButtonUrls[btn.buttonName];
        return {
          buttonName: btn.buttonName,
          buttonType: "WL" as const,
          linkMo: (urls?.linkMo || btn.linkMo || "").trim(),
          linkPc: (urls?.linkPc || btn.linkPc || undefined),
        };
      }
      // 비-웹링크 버튼은 템플릿 그대로 전달 (AL/BK 등)
      return {
        buttonName: btn.buttonName,
        buttonType: btn.buttonType,
        linkAnd: btn.linkAnd,
        linkIos: btn.linkIos,
      };
    });
  }, [messageType, selectedTemplateId, templates, templateButtonUrls]);

  const handleSendClick = () => {
    if (!message.trim()) {
      setMsg({ type: "error", text: "메시지를 입력해주세요." });
      return;
    }
    if (sendTargets.length === 0) {
      setMsg({ type: "error", text: "발송 가능한 수신자가 없습니다." });
      return;
    }
    // 알림톡은 솔라피에 등록·승인된 템플릿 코드가 필수
    if (messageType === "alimtalk" && !templateCode) {
      setMsg({
        type: "error",
        text: "알림톡은 솔라피에 등록·승인된 템플릿을 선택해야 합니다.",
      });
      return;
    }
    // 알림톡: 공통 변수 미입력 검증 (카카오 3063 방지)
    if (messageType === "alimtalk" && selectedTemplateId) {
      const rawVars = getRawVarNames(message);
      const commonVars = rawVars.filter((v) => !PERSONAL_VAR_NAMES.has(v));
      const missing = commonVars.filter((v) => !templateVariables[v]?.trim());
      if (missing.length > 0) {
        setMsg({
          type: "error",
          text: `다음 변수 값을 입력해주세요: ${missing.map((v) => `#{${v}}`).join(", ")}`,
        });
        return;
      }
      // 알림톡 WL 버튼의 linkMo(모바일 URL) 미입력 검증 (카카오 3036 방지)
      // 단, URL에 #{변수}가 포함돼 있으면 카카오가 variables로 치환하므로 검증 제외
      const tpl = templates.find((t) => t.id === selectedTemplateId);
      const webButtons = (tpl?.kakao_buttons || []).filter((b) => b.buttonType === "WL");
      const missingUrls = webButtons.filter((b) => {
        const hasTemplateVar = b.linkMo && /#\{[^}]+\}/.test(b.linkMo);
        if (hasTemplateVar) return false; // 변수 URL은 카카오가 치환
        return !templateButtonUrls[b.buttonName]?.linkMo?.trim();
      });
      if (missingUrls.length > 0) {
        setMsg({
          type: "error",
          text: `다음 버튼의 URL을 입력해주세요: ${missingUrls.map((b) => b.buttonName).join(", ")}`,
        });
        return;
      }
      // 리다이렉트 변수(구글폼 URL) 미입력 / 형식 검증
      for (const [varName, url] of Object.entries(redirectUrls)) {
        const trimmed = url.trim();
        if (!trimmed) {
          setMsg({ type: "error", text: `#{${varName}}의 URL을 입력해주세요.` });
          return;
        }
        if (!/^https?:\/\//i.test(trimmed)) {
          setMsg({
            type: "error",
            text: `#{${varName}}의 URL은 http:// 또는 https://로 시작해야 합니다.`,
          });
          return;
        }
      }
    }
    setShowConfirmSend(true);
  };

  const executeSend = async () => {
    setShowConfirmSend(false);
    setMsg(null);
    setIsSending(true);

    const finalMessage =
      isAdMessage && messageType === "brand_message"
        ? `(광고) KECA\n${message}${unsubscribeNumber ? `\n\n무료수신거부 ${unsubscribeNumber}` : ""}`
        : message;

    try {
      const alimtalkButtons = buildAlimtalkButtons();
      const resolvedVariables =
        messageType === "alimtalk" ? await resolveRedirectVariables() : undefined;
      const res = await fetch("/api/marketing/send-kakao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientIds: sendTargets.map((r) => r.id),
          messageType,
          message: finalMessage,
          templateCode: templateCode || undefined,
          buttons:
            messageType === "alimtalk"
              ? alimtalkButtons
              : (buttons.length > 0 ? buttons : undefined),
          imageUrl: imageUrl || undefined,
          variables: resolvedVariables,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "발송 실패");

      // 부분 실패 체크
      if (result.failCount > 0 && result.successCount > 0) {
        setMsg({
          type: "success",
          text: `${result.successCount}명 발송 성공, ${result.failCount}명 실패`,
        });
      } else {
        setMsg({ type: "success", text: `${result.successCount || 0}명에게 메시지가 발송되었습니다.` });
      }
      sessionStorage.removeItem("marketing_recipients");
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "발송에 실패했습니다." });
    } finally {
      setIsSending(false);
    }
  };

  const handleTestSend = async () => {
    const testPhone = prompt("테스트 수신 번호를 입력하세요 (예: 010-1234-5678)");
    if (!testPhone || !message.trim()) return;
    if (messageType === "alimtalk" && !templateCode) {
      setMsg({
        type: "error",
        text: "알림톡 테스트 발송은 등록된 템플릿을 선택해야 합니다.",
      });
      return;
    }
    setIsSending(true);
    try {
      const alimtalkButtons = buildAlimtalkButtons();
      const resolvedVariables =
        messageType === "alimtalk" ? await resolveRedirectVariables() : undefined;
      const res = await fetch("/api/marketing/send-kakao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientIds: [],
          messageType,
          message,
          templateCode: templateCode || undefined,
          buttons:
            messageType === "alimtalk"
              ? alimtalkButtons
              : (buttons.length > 0 ? buttons : undefined),
          imageUrl: imageUrl || undefined,
          testPhone,
          variables: resolvedVariables,
        }),
      });
      const result = await res.json();
      setMsg({ type: result.error ? "error" : "success", text: result.error || "테스트 발송이 요청되었습니다." });
    } catch {
      setMsg({ type: "error", text: "테스트 발송에 실패했습니다." });
    } finally {
      setIsSending(false);
    }
  };

  const buttonTypeBadge = (type: string) => {
    switch (type) {
      case "video":
        return { label: "동영상", cls: "bg-red-50 text-red-600" };
      case "blog":
        return { label: "블로그", cls: "bg-green-50 text-green-600" };
      default:
        return { label: "일반", cls: "bg-blue-50 text-blue-600" };
    }
  };

  const kakaoStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return { label: "승인", cls: "bg-green-100 text-green-700" };
      case "pending_review":
        return { label: "심사중", cls: "bg-yellow-100 text-yellow-700" };
      case "rejected":
        return { label: "반려", cls: "bg-red-100 text-red-700" };
      default:
        return { label: "미등록", cls: "bg-gray-100 text-gray-600" };
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
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
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
            <p>발송은 공식 딜러사(솔라피)를 통해 처리됩니다.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ 좌측: 작성 폼 ═══ */}
        <div className="lg:col-span-2 space-y-5">
          {/* ─── 발송 유형 ─── */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <p className="text-sm font-medium text-text mb-3">발송 유형</p>
            <div className="flex gap-3">
              <label
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-colors",
                  messageType === "alimtalk" ? "border-primary bg-primary/5" : "border-border-light hover:bg-surface"
                )}
              >
                <input type="radio" name="type" value="alimtalk" checked={messageType === "alimtalk"} onChange={() => setMessageType("alimtalk")} className="hidden" />
                <p className="text-sm font-medium text-text">알림톡</p>
                <p className="text-xs text-text-muted mt-0.5">정보성 메시지 (템플릿 기반)</p>
              </label>
              <label
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl border cursor-pointer transition-colors",
                  messageType === "brand_message" ? "border-yellow-500 bg-yellow-50" : "border-border-light hover:bg-surface"
                )}
              >
                <input type="radio" name="type" value="brand_message" checked={messageType === "brand_message"} onChange={() => setMessageType("brand_message")} className="hidden" />
                <p className="text-sm font-medium text-text">브랜드 메시지</p>
                <p className="text-xs text-text-muted mt-0.5">광고/홍보 메시지 (자유 형식)</p>
              </label>
            </div>
          </div>

          {/* ─── 수신자 ─── */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text">수신자 ({recipients.length}명)</p>
              <div className="flex gap-2">
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
                >
                  <UserPlus size={13} />
                  회원 추가
                </button>
                <div className="relative">
                  <button
                    onClick={loadGroups}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-sub text-xs font-medium rounded-lg hover:bg-border-light transition-colors border border-border-light"
                  >
                    <Users size={13} />
                    그룹 불러오기
                    <ChevronDown size={11} />
                  </button>
                  {showGroupDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-border-light rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                      {groupsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 size={16} className="animate-spin text-text-muted" />
                        </div>
                      ) : groups.length === 0 ? (
                        <p className="text-xs text-text-muted p-3 text-center">수신 그룹이 없습니다.</p>
                      ) : (
                        groups.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => loadGroupMembers(g)}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface transition-colors border-b border-border-light last:border-b-0"
                          >
                            <p className="text-sm font-medium text-text">{g.name}</p>
                            <p className="text-xs text-text-muted">
                              {g.group_type === "dynamic" ? "동적" : "정적"} · {g.member_count || g.member_ids?.length || 0}명
                            </p>
                          </button>
                        ))
                      )}
                      <button
                        onClick={() => setShowGroupDropdown(false)}
                        className="w-full text-center text-xs text-text-muted py-2 hover:bg-surface border-t border-border-light"
                      >
                        닫기
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowExcelUpload(true);
                    setTimeout(() => excelInputRef.current?.click(), 100);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-sub text-xs font-medium rounded-lg hover:bg-border-light transition-colors border border-border-light"
                >
                  <Upload size={13} />
                  엑셀
                </button>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </div>
            </div>

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
              <div className="text-center py-8 bg-yellow-50/50 rounded-xl border border-dashed border-yellow-200">
                <Phone size={32} className="mx-auto text-yellow-400 mb-3" />
                <p className="text-sm text-text-sub mb-1">수신자를 선택해주세요</p>
                <p className="text-xs text-text-muted mb-4">회원 목록에서 개별 또는 그룹(정회원/준회원/강사)으로 선택할 수 있습니다.</p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
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
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full",
                      r.phone ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-400 line-through"
                    )}
                  >
                    {r.name} {r.phone ? `(${r.phone})` : "(연락처 없음)"}
                    {!r.phone && <AlertTriangle size={10} className="text-gray-400" />}
                    <button onClick={() => removeRecipient(r.id)} className="hover:text-error">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ─── 템플릿 선택 ─── */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text">템플릿</p>
              <button
                onClick={handleSyncTemplates}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-sub bg-surface rounded-lg hover:bg-border-light transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                솔라피 동기화
              </button>
            </div>

            {selectedTemplate ? (
              <div className="p-3 bg-surface rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">{selectedTemplate.name}</p>
                    {selectedTemplate.kakao_template_code && (
                      <p className="text-xs text-text-muted mt-0.5">
                        코드: <span className="font-mono">{selectedTemplate.kakao_template_code}</span>
                      </p>
                    )}
                    <div className="flex gap-1.5 mt-1.5">
                      <span className={cn("px-1.5 py-0.5 text-xs rounded", kakaoStatusBadge(selectedTemplate.kakao_status).cls)}>
                        {kakaoStatusBadge(selectedTemplate.kakao_status).label}
                      </span>
                      <span className="px-1.5 py-0.5 text-xs rounded bg-surface text-text-muted">
                        {selectedTemplate.type === "alimtalk" ? "알림톡" : "브랜드메시지"}
                      </span>
                    </div>
                  </div>
                  <button onClick={clearTemplate} className="p-1 text-text-muted hover:text-error rounded">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted mb-3">직접 작성 또는 템플릿을 선택하세요.</p>
            )}

            <button
              onClick={() => {
                setShowTemplateModal(true);
                setPreviewTemplate(null);
                setTemplateSearch("");
              }}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <FileText size={14} />
              템플릿 선택
            </button>
          </div>

          {/* ─── 메시지 작성 ─── */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            {messageType === "alimtalk" ? (
              /* ── 알림톡: 템플릿 기반 ── */
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text">메시지 내용 (템플릿)</p>
                  <p className="text-xs text-text-muted">자동 치환: #{"{이름}"}, #{"{연락처}"}</p>
                </div>
                <div className="mb-3 p-2.5 bg-surface rounded-lg">
                  <p className="text-xs text-text-muted">
                    알림톡은 카카오 검수를 통과한 템플릿만 사용 가능합니다. 솔라피 대시보드에서 템플릿을 등록하고 승인받은 후 사용하세요.
                  </p>
                </div>

                {selectedTemplateId && message ? (
                  <>
                    <div className="relative">
                      <div className="absolute top-2 right-2">
                        <Lock size={14} className="text-text-muted" />
                      </div>
                      <div className="w-full px-3 py-2 border border-border-light rounded-lg text-sm bg-gray-50 whitespace-pre-wrap min-h-[200px]">
                        {renderWithHighlightedVars(message)}
                      </div>
                    </div>
                    {(() => {
                      const tpl = templates.find((t) => t.id === selectedTemplateId);
                      const bodyVars = getRawVarNames(message);
                      // 버튼 URL에만 있는 변수도 포함 (예: https://keca.vercel.app/apply/#{code})
                      const buttonVars = (tpl?.kakao_buttons || []).flatMap((b) => [
                        ...(b.linkMo ? getRawVarNames(b.linkMo) : []),
                        ...(b.linkPc ? getRawVarNames(b.linkPc) : []),
                      ]);
                      const rawVars = [...new Set([...bodyVars, ...buttonVars])];
                      const personalVars = rawVars.filter((v) => PERSONAL_VAR_NAMES.has(v));
                      const redirectVars = rawVars.filter((v) => REDIRECT_VAR_NAMES.has(v));
                      const commonVars = rawVars.filter(
                        (v) => !PERSONAL_VAR_NAMES.has(v) && !REDIRECT_VAR_NAMES.has(v)
                      );
                      return (
                        <div className="mt-3 space-y-3">
                          {personalVars.length > 0 && (
                            <div className="p-2.5 bg-green-50 rounded-lg">
                              <p className="text-xs text-green-700">
                                자동 치환: {personalVars.map((v) => `#{${v}}`).join(", ")} → 수신자 정보로 자동 입력됩니다.
                              </p>
                            </div>
                          )}
                          {commonVars.length > 0 && (
                            <div className="p-3 border border-blue-200 bg-blue-50/30 rounded-lg space-y-2">
                              <p className="text-xs font-medium text-blue-700">
                                공통 변수 입력 (모든 수신자에게 동일하게 전송)
                              </p>
                              {commonVars.map((varName) => (
                                <div key={varName} className="flex items-center gap-2">
                                  <label className="text-xs font-mono text-blue-700 min-w-[100px] shrink-0">
                                    {`#{${varName}}`}
                                  </label>
                                  <input
                                    type="text"
                                    value={templateVariables[varName] || ""}
                                    onChange={(e) =>
                                      setTemplateVariables((prev) => ({
                                        ...prev,
                                        [varName]: e.target.value,
                                      }))
                                    }
                                    placeholder={`${varName} 값 입력`}
                                    className="flex-1 px-2.5 py-1.5 border border-blue-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          {/* 구글폼/외부 URL 단축 링크 입력 */}
                          {redirectVars.length > 0 && (
                            <div className="p-3 border border-purple-200 bg-purple-50/40 rounded-lg space-y-2">
                              <p className="text-xs font-medium text-purple-700">
                                신청 링크 입력 (자체 도메인 단축 URL로 자동 변환)
                              </p>
                              <p className="text-[11px] text-purple-600">
                                입력한 URL은 발송 직전 keca.vercel.app/apply/{`{code}`} 형태의 단축 링크로
                                치환되어 카카오톡 수신자에게 전달됩니다.
                              </p>
                              {redirectVars.map((varName) => (
                                <div key={varName} className="flex items-center gap-2">
                                  <label className="text-xs font-mono text-purple-700 min-w-[100px] shrink-0">
                                    {`#{${varName}}`}
                                  </label>
                                  <input
                                    type="url"
                                    value={redirectUrls[varName] || ""}
                                    onChange={(e) =>
                                      setRedirectUrls((prev) => ({
                                        ...prev,
                                        [varName]: e.target.value,
                                      }))
                                    }
                                    placeholder="https://docs.google.com/forms/..."
                                    className="flex-1 px-2.5 py-1.5 border border-purple-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          {/* 템플릿 링크 버튼 URL 입력 */}
                          {(() => {
                            const tpl = templates.find((t) => t.id === selectedTemplateId);
                            const allBtns = tpl?.kakao_buttons || [];
                            const webBtns = allBtns.filter((b) => b.buttonType === "WL");
                            const otherBtns = allBtns.filter((b) => b.buttonType !== "WL");
                            if (allBtns.length === 0) return null;
                            return (
                              <div className="p-3 border border-yellow-200 bg-yellow-50/40 rounded-lg space-y-3">
                                <p className="text-xs font-medium text-yellow-800">
                                  템플릿 링크 버튼 URL 입력
                                </p>
                                {webBtns.map((btn) => {
                                  const urls = templateButtonUrls[btn.buttonName] || { linkMo: "" };
                                  // URL에 #{변수}가 포함돼 있으면 카카오가 variables로 치환하므로 readonly
                                  const hasVarInLinkMo = !!btn.linkMo && /#\{[^}]+\}/.test(btn.linkMo);
                                  const hasVarInLinkPc = !!btn.linkPc && /#\{[^}]+\}/.test(btn.linkPc);
                                  return (
                                    <div key={btn.buttonName} className="space-y-1.5">
                                      <label className="text-xs font-medium text-text">
                                        {btn.buttonName}{" "}
                                        <span className="text-text-muted">(웹 링크)</span>
                                      </label>
                                      {hasVarInLinkMo ? (
                                        <>
                                          <input
                                            type="text"
                                            value={btn.linkMo || ""}
                                            readOnly
                                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-text-muted font-mono"
                                          />
                                          <p className="text-[11px] text-gray-500">
                                            이 URL은 위의 변수 입력 값으로 자동 치환됩니다 (편집 불필요).
                                          </p>
                                        </>
                                      ) : (
                                        <input
                                          type="text"
                                          placeholder="https://... (모바일, 필수)"
                                          value={urls.linkMo}
                                          onChange={(e) =>
                                            setTemplateButtonUrls((prev) => ({
                                              ...prev,
                                              [btn.buttonName]: {
                                                ...prev[btn.buttonName],
                                                linkMo: e.target.value,
                                              },
                                            }))
                                          }
                                          className="w-full px-2.5 py-1.5 border border-yellow-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white"
                                        />
                                      )}
                                      {hasVarInLinkPc ? (
                                        <input
                                          type="text"
                                          value={btn.linkPc || ""}
                                          readOnly
                                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-text-muted font-mono"
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          placeholder="https://... (PC, 선택)"
                                          value={urls.linkPc || ""}
                                          onChange={(e) =>
                                            setTemplateButtonUrls((prev) => ({
                                              ...prev,
                                              [btn.buttonName]: {
                                                ...prev[btn.buttonName],
                                                linkMo: prev[btn.buttonName]?.linkMo || "",
                                                linkPc: e.target.value || undefined,
                                              },
                                            }))
                                          }
                                          className="w-full px-2.5 py-1.5 border border-yellow-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-white"
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                                {otherBtns.length > 0 && (
                                  <p className="text-xs text-text-muted">
                                    추가 버튼: {otherBtns.map((b) => b.buttonName).join(", ")} (URL 편집 불필요)
                                  </p>
                                )}
                                <p className="text-xs text-yellow-700">
                                  ⓘ 버튼 이름·타입은 승인된 템플릿과 동일해야 합니다. URL만 변경 가능합니다.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                      placeholder={"[KECA] #{이름}님, 교육 일정 안내\n\n교육명: OO 과정\n일시: 2026-00-00 10:00\n장소: OOO\n\n자세한 내용은 홈페이지를 확인해주세요."}
                      className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                    />
                    <p className="text-xs text-text-muted mt-1">솔라피에서 검수 승인된 템플릿 사용을 권장합니다.</p>
                  </>
                )}
                <p className="text-xs text-text-muted text-right mt-1">{message.length}자</p>
              </>
            ) : (
              /* ── 브랜드 메시지: 자유 형식 ── */
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text">메시지 내용 (자유 작성)</p>
                </div>

                {/* 메시지 유형 서브 탭 */}
                <div className="flex gap-2 mb-3">
                  {(
                    [
                      { key: "text", label: "텍스트형" },
                      { key: "image", label: "이미지형" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setBrandMessageType(t.key)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                        brandMessageType === t.key
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : "border-border-light text-text-sub hover:bg-surface"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* 변수 삽입 버튼 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-text-muted">변수 삽입:</span>
                  {["#{이름}", "#{연락처}"].map((v) => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="px-2 py-1 text-xs font-mono bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                {/* 이미지형: 이미지 업로드 */}
                {brandMessageType === "image" && (
                  <div className="mb-3">
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
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={imageUploading}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-text-sub hover:bg-surface transition-colors disabled:opacity-50"
                        >
                          {imageUploading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> 업로드 중...
                            </>
                          ) : (
                            <>
                              <ImageIcon size={14} /> 이미지 선택
                            </>
                          )}
                        </button>
                        <p className="text-xs text-text-muted mt-1.5">800x400 권장, JPG/PNG, 최대 5MB</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 텍스트 입력 */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    if (maxChars > 0 && e.target.value.length > maxChars) return;
                    setMessage(e.target.value);
                  }}
                  rows={brandMessageType === "image" ? 5 : 8}
                  placeholder={"안녕하세요, #{이름}님!\n\nKECA에서 새로운 교육 프로그램을 준비했습니다.\n\n자세한 내용 확인하기 >"}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200 resize-y"
                />
                <div className="flex items-center justify-between mt-1">
                  <div />
                  <p
                    className={cn(
                      "text-xs",
                      maxChars > 0 && message.length > maxChars * 0.92
                        ? message.length >= maxChars
                          ? "text-red-500 font-medium"
                          : "text-yellow-600"
                        : "text-text-muted"
                    )}
                  >
                    {message.length}/{maxChars.toLocaleString()}자
                  </p>
                </div>

                {/* 광고성 메시지 */}
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdMessage}
                      onChange={(e) => setIsAdMessage(e.target.checked)}
                      className="rounded border-border text-yellow-500 focus:ring-yellow-200"
                    />
                    <span className="text-sm text-text">광고성 메시지</span>
                  </label>
                  {isAdMessage && (
                    <div className="p-2.5 bg-yellow-50 rounded-lg space-y-2">
                      <p className="text-xs text-yellow-700">
                        &quot;(광고)&quot; 접두사와 수신거부 안내가 메시지에 자동 추가됩니다.
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-yellow-700 whitespace-nowrap">080 수신거부:</label>
                        <input
                          value={unsubscribeNumber}
                          onChange={(e) => setUnsubscribeNumber(e.target.value)}
                          placeholder="080-XXX-XXXX"
                          className="flex-1 px-2 py-1 border border-yellow-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-300"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 p-2.5 bg-surface rounded-lg">
                  <p className="text-xs text-text-muted">
                    브랜드 메시지는 채널 친구에게만 발송 가능하며, 야간(21:00~08:00) 발송이 불가합니다. 광고성 메시지 발송 시 관련 법률을 준수해 주세요.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ─── 링크 버튼 ─── */}
          <div className="bg-white border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-text-sub" />
                <p className="text-sm font-medium text-text">링크 버튼 ({buttons.length}/5)</p>
              </div>
              {buttons.length < 5 && !(messageType === "alimtalk" && selectedTemplateId) && (
                <button
                  onClick={() => setShowAddButton(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Plus size={12} />
                  링크 버튼 추가
                </button>
              )}
            </div>

            {messageType === "alimtalk" && selectedTemplateId && (
              <p className="text-xs text-text-muted mb-3">
                알림톡 버튼은 템플릿에 등록된 버튼을 사용하며, URL은 위 메시지 내용 영역의 &quot;템플릿 링크 버튼 URL 입력&quot; 섹션에서 지정합니다.
              </p>
            )}

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
                          <a
                            href={btn.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate max-w-xs"
                          >
                            {btn.url}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                        {!(messageType === "alimtalk" && selectedTemplateId) && (
                          <button onClick={() => removeButton(idx)} className="p-1 text-text-muted hover:text-error rounded">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {ogLoading.has(idx) ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
                          <Loader2 size={12} className="animate-spin" />
                          미리보기 로딩 중...
                        </div>
                      ) : og ? (
                        <div className="mt-2 flex gap-2 p-2 bg-surface rounded-lg">
                          {og.image && <img src={og.image} alt="" className="w-16 h-16 object-cover rounded shrink-0" />}
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

            {showAddButton && (
              <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-sub">버튼 이름 (14자 이내)</label>
                  <input
                    value={newButtonName}
                    onChange={(e) => setNewButtonName(e.target.value)}
                    maxLength={14}
                    placeholder="예: 자세히 보기"
                    className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-text-muted mt-0.5">{newButtonName.length}/14자</p>
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
                      {ogData[newButtonUrl].description && (
                        <p className="text-xs text-text-muted line-clamp-2">{ogData[newButtonUrl].description}</p>
                      )}
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <button onClick={() => setShowAddButton(false)} className="flex-1 px-3 py-2 text-sm text-text-sub bg-surface rounded-lg hover:bg-border-light">
                    취소
                  </button>
                  <button
                    onClick={handleAddButton}
                    disabled={!newButtonName.trim() || !newButtonUrl.trim()}
                    className="flex-1 px-3 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    추가
                  </button>
                </div>
              </div>
            )}

            {buttons.length === 0 && !showAddButton && (
              <p className="text-xs text-text-muted">링크 버튼을 추가하면 메시지에 클릭 가능한 버튼이 포함됩니다.</p>
            )}
          </div>

          {/* ─── 이미지 첨부 (브랜드 메시지 텍스트형만) ─── */}
          {messageType === "brand_message" && brandMessageType === "text" && (
            <div className="bg-white border border-border-light rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-text-sub" />
                <p className="text-sm font-medium text-text">이미지 첨부 (선택)</p>
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
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-text-sub hover:bg-surface transition-colors disabled:opacity-50"
                  >
                    {imageUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> 업로드 중...
                      </>
                    ) : (
                      <>
                        <ImageIcon size={14} /> 이미지 선택
                      </>
                    )}
                  </button>
                  <p className="text-xs text-text-muted mt-1.5">JPG, PNG 등 이미지 파일 (권장 크기: 800x400px)</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ 우측: 액션 패널 ═══ */}
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
                <span className="font-medium text-green-600">{sendTargets.length}명</span>
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
              <button
                onClick={handleSendClick}
                disabled={
                  isSending ||
                  sendTargets.length === 0 ||
                  !message.trim() ||
                  (messageType === "alimtalk" && !templateCode)
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                {isSending ? "발송 중..." : messageType === "alimtalk" ? "알림톡 발송" : "브랜드 메시지 발송"}
              </button>
              {messageType === "alimtalk" && !templateCode && (
                <p className="mt-2 text-xs text-yellow-700">
                  알림톡 발송에는 솔라피에 등록된 템플릿 선택이 필요합니다.
                </p>
              )}
            </div>

            <button
              onClick={handleTestSend}
              disabled={isSending || !message.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface text-text-sub text-xs font-medium rounded-xl hover:bg-border-light transition-colors disabled:opacity-50 mt-2"
            >
              테스트 발송 (1건)
            </button>

            <div className="mt-4 p-3 bg-surface rounded-lg">
              <p className="text-xs text-text-muted">
                {messageType === "alimtalk"
                  ? "알림톡은 수신 동의 없이 발송 가능하지만, 계약/거래 관련 정보만 허용됩니다."
                  : "브랜드 메시지는 채널 친구 + 광고 수신 동의 고객에게만 발송됩니다."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 발송 확인 모달 ═══ */}
      {showConfirmSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <Send size={20} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">
                {messageType === "alimtalk" ? "알림톡" : "브랜드 메시지"} 발송 확인
              </h3>
              <p className="text-sm text-text-sub">
                <span className="font-bold text-yellow-600">{sendTargets.length}명</span>에게{" "}
                {messageType === "alimtalk" ? "알림톡" : "브랜드 메시지"}을 발송합니다.
              </p>
              <p className="text-xs text-text-muted mt-1">발송 후에는 취소할 수 없습니다.</p>
            </div>
            <div className="flex gap-2 p-5 border-t border-border-light">
              <button
                onClick={() => setShowConfirmSend(false)}
                className="flex-1 px-4 py-2.5 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors"
              >
                취소
              </button>
              <button
                onClick={executeSend}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-xl hover:bg-yellow-600 transition-colors"
              >
                <Send size={14} />
                발송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 수신자 추가 모달 ═══ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-light shrink-0">
              <h3 className="text-lg font-bold text-text">수신자 선택</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            <div className="px-5 pt-4 pb-3 space-y-3 shrink-0">
              {/* 그룹 빠른 선택 */}
              {!membersLoading && allMembers.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-2">그룹 선택</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "정회원", icon: Users, color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100", filter: (m: Profile) => m.role === "member" },
                      { label: "준회원", icon: Users, color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100", filter: (m: Profile) => m.role === "associate" },
                      { label: "강사", icon: GraduationCap, color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100", filter: (m: Profile) => m.is_instructor },
                    ].map((group) => {
                      const groupMembers = allMembers.filter(group.filter);
                      const allGroupSelected = groupMembers.length > 0 && groupMembers.every((m) => modalSelected.has(m.id));
                      return (
                        <button
                          key={group.label}
                          onClick={() => {
                            setModalSelected((prev) => {
                              const next = new Set(prev);
                              if (allGroupSelected) groupMembers.forEach((m) => next.delete(m.id));
                              else groupMembers.forEach((m) => next.add(m.id));
                              return next;
                            });
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                            allGroupSelected ? "bg-yellow-500 text-white border-yellow-500" : group.color
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
                        setModalSelected(allSelected ? new Set() : new Set(allMembers.map((m) => m.id)));
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                        allMembers.length > 0 && allMembers.every((m) => modalSelected.has(m.id))
                          ? "bg-yellow-500 text-white border-yellow-500"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      <Phone size={13} />
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
                      modalFilter === f.key ? "bg-yellow-500 text-white" : "text-text-sub hover:bg-white"
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
                  placeholder="이름, 이메일 또는 연락처 검색"
                  className="w-full pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>
            </div>

            {/* 회원 목록 */}
            <div className="flex-1 overflow-y-auto px-5">
              {membersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" />
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
                          className="rounded border-border text-yellow-500 focus:ring-yellow-200"
                        />
                      </th>
                      <th className="text-left px-3 py-2 font-medium">이름</th>
                      <th className="text-left px-3 py-2 font-medium">연락처</th>
                      <th className="text-left px-3 py-2 font-medium">이메일</th>
                      <th className="text-center px-3 py-2 font-medium">유형</th>
                      <th className="text-center px-3 py-2 font-medium">카카오동의</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {filteredModalMembers.map((m) => (
                      <tr
                        key={m.id}
                        className={cn("hover:bg-surface/50 cursor-pointer", modalSelected.has(m.id) && "bg-yellow-50/50")}
                        onClick={() => toggleModalSelect(m.id)}
                      >
                        <td className="text-center px-2 py-2">
                          <input
                            type="checkbox"
                            checked={modalSelected.has(m.id)}
                            onChange={() => toggleModalSelect(m.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-border text-yellow-500 focus:ring-yellow-200"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-text">{m.name}</td>
                        <td className="px-3 py-2 text-text-sub text-xs">
                          {m.phone ? (
                            m.phone
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <AlertTriangle size={10} />
                              (없음)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-text-sub text-xs">{m.email}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-xs text-text-muted">{roleLabels[m.role] || m.role}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-xs ${m.marketing_kakao_agreed ? "text-green-600" : "text-gray-400"}`}>
                            {m.marketing_kakao_agreed ? "동의" : "미동의"}
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

            <div className="flex items-center justify-between p-5 border-t border-border-light shrink-0">
              <span className="text-sm text-text-sub">
                <span className="text-yellow-600 font-bold">{modalSelected.size}</span>명 선택됨
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
                  className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-xl hover:bg-yellow-600 transition-colors"
                >
                  수신자 적용
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 템플릿 선택 모달 ═══ */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-light shrink-0">
              <h3 className="text-lg font-bold text-text">템플릿 선택</h3>
              <button onClick={() => setShowTemplateModal(false)} className="p-1 text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* 좌측: 템플릿 리스트 */}
              <div className="w-[60%] border-r border-border-light flex flex-col">
                <div className="p-4 space-y-3 shrink-0">
                  {/* 유형 필터 */}
                  <div className="flex gap-1 bg-surface rounded-lg p-1">
                    {(
                      [
                        { key: "all", label: "전체" },
                        { key: "alimtalk", label: "알림톡" },
                        { key: "brand_message", label: "브랜드메시지" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setTemplateFilter(f.key)}
                        className={cn(
                          "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                          templateFilter === f.key ? "bg-white text-text shadow-sm" : "text-text-sub hover:text-text"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* 상태 필터 */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(
                      [
                        { key: "all", label: "전체", cls: "bg-gray-100 text-gray-600" },
                        { key: "approved", label: "승인", cls: "bg-green-100 text-green-700" },
                        { key: "pending_review", label: "심사중", cls: "bg-yellow-100 text-yellow-700" },
                        { key: "rejected", label: "반려", cls: "bg-red-100 text-red-700" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setTemplateStatusFilter(f.key)}
                        className={cn(
                          "px-2.5 py-1 text-xs rounded-full transition-colors border",
                          templateStatusFilter === f.key
                            ? "border-text font-medium ring-1 ring-text/20"
                            : "border-transparent",
                          f.cls
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
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="템플릿 이름 검색"
                      className="w-full pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* 템플릿 카드 리스트 */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare size={32} className="mx-auto text-text-muted mb-3" />
                      <p className="text-sm text-text-muted">템플릿이 없습니다.</p>
                      <p className="text-xs text-text-muted mt-1">솔라피 동기화를 실행하거나 새 템플릿을 등록하세요.</p>
                    </div>
                  ) : (
                    filteredTemplates.map((t) => {
                      const status = kakaoStatusBadge(t.kakao_status);
                      const isSelected = previewTemplate?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setPreviewTemplate(t)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-colors",
                            isSelected ? "border-primary bg-primary/5" : "border-border-light hover:bg-surface"
                          )}
                        >
                          <p className="text-sm font-medium text-text">{t.name}</p>
                          {t.kakao_template_code && (
                            <p className="text-xs text-text-muted mt-0.5 font-mono">{t.kakao_template_code}</p>
                          )}
                          <div className="flex gap-1.5 mt-1.5">
                            <span className={cn("px-1.5 py-0.5 text-xs rounded", status.cls)}>{status.label}</span>
                            <span className="px-1.5 py-0.5 text-xs rounded bg-surface text-text-muted">
                              {t.type === "alimtalk" ? "알림톡" : "브랜드메시지"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 우측: 미리보기 */}
              <div className="w-[40%] flex flex-col p-5">
                {previewTemplate ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm font-bold text-text">{previewTemplate.name}</p>
                      {previewTemplate.kakao_template_code && (
                        <p className="text-xs text-text-muted mt-0.5">
                          코드: <span className="font-mono">{previewTemplate.kakao_template_code}</span>
                        </p>
                      )}
                      <div className="flex gap-1.5 mt-1.5">
                        <span className={cn("px-1.5 py-0.5 text-xs rounded", kakaoStatusBadge(previewTemplate.kakao_status).cls)}>
                          {kakaoStatusBadge(previewTemplate.kakao_status).label}
                        </span>
                        <span className="px-1.5 py-0.5 text-xs rounded bg-surface text-text-muted">
                          {previewTemplate.type === "alimtalk" ? "알림톡" : "브랜드메시지"}
                        </span>
                      </div>
                    </div>

                    {/* 카카오톡 말풍선 프리뷰 */}
                    <div className="flex-1 overflow-y-auto">
                      <p className="text-xs text-text-muted mb-2">미리보기</p>
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                          <MessageSquare size={14} className="text-white" />
                        </div>
                        <div className="max-w-[260px]">
                          <p className="text-xs text-text-muted mb-1">KECA</p>
                          <div className="bg-[#FEE500] rounded-2xl rounded-tl-sm p-1">
                            <div className="bg-white rounded-xl p-3 text-sm whitespace-pre-wrap leading-relaxed">
                              {renderWithHighlightedVars(previewTemplate.body)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 변수 안내 */}
                      {(() => {
                        const vars = getTemplateVars(previewTemplate.body);
                        return vars.length > 0 ? (
                          <div className="mt-3 p-2.5 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-700">
                              이 템플릿에는 {vars.join(", ")} 변수가 포함되어 있습니다. 수신자의 해당 정보가 자동으로 치환됩니다.
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* 사용 버튼 */}
                    <div className="mt-4 pt-4 border-t border-border-light">
                      {previewTemplate.kakao_status === "approved" || previewTemplate.type === "brand_message" ? (
                        <button
                          onClick={() => applyTemplate(previewTemplate)}
                          className="w-full px-4 py-2.5 bg-yellow-500 text-white text-sm font-medium rounded-xl hover:bg-yellow-600 transition-colors"
                        >
                          이 템플릿 사용
                        </button>
                      ) : (
                        <div>
                          <button
                            disabled
                            className="w-full px-4 py-2.5 bg-gray-200 text-gray-400 text-sm font-medium rounded-xl cursor-not-allowed"
                          >
                            이 템플릿 사용
                          </button>
                          <p className="text-xs text-red-500 mt-1.5 text-center">
                            이 템플릿은 아직 승인되지 않았습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <FileText size={32} className="mx-auto text-text-muted mb-3" />
                      <p className="text-sm text-text-muted">좌측에서 템플릿을 선택하세요</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-border-light shrink-0">
              <button
                onClick={clearTemplate}
                className="text-sm text-text-sub hover:text-text transition-colors"
              >
                직접 작성으로 전환
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
