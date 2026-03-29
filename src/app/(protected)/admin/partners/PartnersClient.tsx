"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Edit2, Trash2, Building2, GripVertical, Save, X, Upload, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { createPartner, updatePartner, deletePartner } from "@/lib/supabase/mutations";
import type { Partner } from "@/types";
import Image from "next/image";

export default function PartnersClient({ partners: initialPartners }: { partners: Partner[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 폼 상태
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setWebsite("");
    setLogoUrl("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleUploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "partners");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setLogoUrl(data.url);
      }
    } catch {
      setMsg({ type: "error", text: "로고 업로드에 실패했습니다." });
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createPartner({ name, website_url: website || undefined, logo_url: logoUrl || undefined });
        resetForm();
        setMsg({ type: "success", text: "파트너가 추가되었습니다." });
      } catch {
        setMsg({ type: "error", text: "파트너 추가에 실패했습니다." });
      }
    });
  };

  const handleEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setName(partner.name);
    setWebsite(partner.website_url || "");
    setLogoUrl(partner.logo_url || "");
    setShowForm(true);
  };

  const handleUpdate = () => {
    if (!editingId || !name.trim()) return;
    startTransition(async () => {
      try {
        await updatePartner(editingId, {
          name,
          website_url: website || null,
          logo_url: logoUrl || null,
        });
        resetForm();
        setMsg({ type: "success", text: "파트너 정보가 수정되었습니다." });
      } catch {
        setMsg({ type: "error", text: "파트너 수정에 실패했습니다." });
      }
    });
  };

  const handleDelete = (id: string, partnerName: string) => {
    if (!confirm(`"${partnerName}" 파트너를 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deletePartner(id);
        setMsg({ type: "success", text: "파트너가 삭제되었습니다." });
      } catch {
        setMsg({ type: "error", text: "파트너 삭제에 실패했습니다." });
      }
    });
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await updatePartner(id, { is_active: !currentActive });
        setMsg({ type: "success", text: currentActive ? "파트너가 비활성화되었습니다." : "파트너가 활성화되었습니다." });
      } catch {
        setMsg({ type: "error", text: "상태 변경에 실패했습니다." });
      }
    });
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const idx = initialPartners.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= initialPartners.length) return;

    const currentOrder = initialPartners[idx].sort_order;
    const swapOrder = initialPartners[swapIdx].sort_order;

    startTransition(async () => {
      try {
        await updatePartner(id, { sort_order: swapOrder });
        await updatePartner(initialPartners[swapIdx].id, { sort_order: currentOrder });
        setMsg({ type: "success", text: "순서가 변경되었습니다." });
      } catch {
        setMsg({ type: "error", text: "순서 변경에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">파트너 관리</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> 파트너 추가
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-primary/20 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-text mb-3">
            {editingId ? "파트너 수정" : "새 파트너 추가"}
          </h3>

          {/* 로고 업로드 */}
          <div className="mb-4">
            <label className="block text-xs text-text-sub mb-1.5">로고 이미지</label>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div className="relative w-16 h-16 rounded-lg bg-surface border border-border-light overflow-hidden">
                  <Image src={logoUrl} alt="로고" fill className="object-contain p-1" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-surface border border-border-light flex items-center justify-center">
                  <Building2 size={20} className="text-text-muted" />
                </div>
              )}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadLogo(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark transition-colors"
                >
                  <Upload size={13} />
                  {uploading ? "업로드 중..." : "이미지 선택"}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="text-xs text-text-muted hover:text-error mt-1"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="기관명 *"
              className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              disabled={isPending}
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50"
            >
              <Save size={14} /> {isPending ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-text-sub border border-border-light hover:bg-surface"
            >
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {initialPartners.map((partner, idx) => (
          <div
            key={partner.id}
            className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${
              partner.is_active === false ? "border-border-light opacity-60" : "border-border-light"
            }`}
          >
            {/* 순서 변경 */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => handleMove(partner.id, "up")}
                disabled={idx === 0 || isPending}
                className="p-0.5 text-text-muted hover:text-primary disabled:opacity-30"
              >
                <ArrowUp size={12} />
              </button>
              <button
                onClick={() => handleMove(partner.id, "down")}
                disabled={idx === initialPartners.length - 1 || isPending}
                className="p-0.5 text-text-muted hover:text-primary disabled:opacity-30"
              >
                <ArrowDown size={12} />
              </button>
            </div>

            {/* 로고 */}
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0 overflow-hidden">
              {partner.logo_url ? (
                <Image src={partner.logo_url} alt={partner.name} width={40} height={40} className="object-contain p-0.5" />
              ) : (
                <Building2 size={18} className="text-text-muted" />
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text">{partner.name}</h3>
              <p className="text-xs text-text-muted truncate">{partner.website_url || "-"}</p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleToggleActive(partner.id, partner.is_active !== false)}
                disabled={isPending}
                className="p-1.5 text-text-muted hover:text-primary rounded disabled:opacity-50"
                title={partner.is_active !== false ? "비활성화" : "활성화"}
              >
                {partner.is_active !== false ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => handleEdit(partner)}
                disabled={isPending}
                className="p-1.5 text-text-muted hover:text-primary rounded disabled:opacity-50"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDelete(partner.id, partner.name)}
                disabled={isPending}
                className="p-1.5 text-text-muted hover:text-error rounded disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {initialPartners.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">등록된 파트너가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
