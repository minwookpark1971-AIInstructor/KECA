"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Building2, GripVertical, Save, X } from "lucide-react";
import { createPartner, deletePartner } from "@/lib/supabase/mutations";
import type { Partner } from "@/types";

export default function PartnersClient({ partners }: { partners: Partner[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createPartner({ name, website_url: website || undefined });
        setName("");
        setWebsite("");
        setShowForm(false);
        setMsg({ type: "success", text: "파트너가 추가되었습니다." });
      } catch {
        setMsg({ type: "error", text: "파트너 추가에 실패했습니다." });
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">파트너 관리</h1>
        <button
          onClick={() => setShowForm(true)}
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
          <h3 className="text-sm font-bold text-text mb-3">새 파트너 추가</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="기관명"
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
              onClick={handleAdd}
              disabled={isPending}
              className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50"
            >
              <Save size={14} /> {isPending ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-text-sub border border-border-light hover:bg-surface"
            >
              <X size={14} /> 취소
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white border border-border-light rounded-xl p-4 flex items-center gap-4">
            <GripVertical size={16} className="text-text-muted/40 shrink-0" />
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text">{partner.name}</h3>
              <p className="text-xs text-text-muted">{partner.website_url || "-"}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
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
        {partners.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">등록된 파트너가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
