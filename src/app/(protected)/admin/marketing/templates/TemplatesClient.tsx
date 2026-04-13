"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, X, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { createMarketingTemplate, updateMarketingTemplate, deleteMarketingTemplate } from "@/lib/supabase/mutations";
import type { MarketingTemplate } from "@/types";

const channelLabels: Record<string, { label: string; icon: typeof Mail }> = {
  email: { label: "이메일", icon: Mail },
  kakao: { label: "카카오", icon: MessageSquare },
};

export default function TemplatesClient({ templates }: { templates: MarketingTemplate[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MarketingTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    channel: "email" as "email" | "kakao",
    subject: "",
    body: "",
    variables: "",
  });

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", channel: "email", subject: "", body: "", variables: "" });
    setShowModal(true);
  };

  const openEdit = (t: MarketingTemplate) => {
    setEditing(t);
    setFormData({
      name: t.name,
      channel: t.channel,
      subject: t.subject || "",
      body: t.body,
      variables: (t.variables || []).join(", "),
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.body.trim()) {
      setMsg({ type: "error", text: "이름과 본문은 필수입니다." });
      return;
    }

    startTransition(async () => {
      try {
        const variables = formData.variables.split(",").map((v) => v.trim()).filter(Boolean);
        if (editing) {
          await updateMarketingTemplate(editing.id, {
            name: formData.name,
            channel: formData.channel,
            subject: formData.subject || null,
            body: formData.body,
            variables,
          });
          setMsg({ type: "success", text: "템플릿이 수정되었습니다." });
        } else {
          await createMarketingTemplate({
            name: formData.name,
            channel: formData.channel,
            subject: formData.subject || undefined,
            body: formData.body,
            variables,
          });
          setMsg({ type: "success", text: "템플릿이 생성되었습니다." });
        }
        setShowModal(false);
      } catch {
        setMsg({ type: "error", text: "저장에 실패했습니다." });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" 템플릿을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteMarketingTemplate(id);
        setMsg({ type: "success", text: "템플릿이 삭제되었습니다." });
      } catch {
        setMsg({ type: "error", text: "삭제에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing" className="p-1.5 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-text-sub" />
          </Link>
          <h1 className="text-2xl font-bold text-text">템플릿 관리</h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={15} />
          새 템플릿
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        {templates.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">등록된 템플릿이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-left px-5 py-3 font-medium">이름</th>
                <th className="text-center px-3 py-3 font-medium">채널</th>
                <th className="text-left px-3 py-3 font-medium hidden sm:table-cell">제목</th>
                <th className="text-left px-3 py-3 font-medium hidden md:table-cell">변수</th>
                <th className="text-center px-3 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {templates.map((t) => {
                const ch = channelLabels[t.channel];
                return (
                  <tr key={t.id} className="hover:bg-surface/50">
                    <td className="px-5 py-3 font-medium text-text">{t.name}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-surface rounded-full">
                        {ch && <ch.icon size={12} />}
                        {ch?.label || t.channel}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-text-sub hidden sm:table-cell truncate max-w-[200px]">{t.subject || "-"}</td>
                    <td className="px-3 py-3 text-text-muted text-xs hidden md:table-cell">{(t.variables || []).join(", ") || "-"}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(t)} disabled={isPending} className="p-1 text-text-muted hover:text-primary rounded"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(t.id, t.name)} disabled={isPending} className="p-1 text-text-muted hover:text-error rounded"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">{editing ? "템플릿 수정" : "새 템플릿"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-text-muted hover:text-text"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-text">이름</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-text">채널</label>
                <select value={formData.channel} onChange={(e) => setFormData({ ...formData, channel: e.target.value as "email" | "kakao" })} className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none">
                  <option value="email">이메일</option>
                  <option value="kakao">카카오톡</option>
                </select>
              </div>
              {formData.channel === "email" && (
                <div>
                  <label className="text-sm font-medium text-text">제목</label>
                  <input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-text">본문</label>
                <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} rows={8} className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" />
              </div>
              <div>
                <label className="text-sm font-medium text-text">변수 (쉼표 구분)</label>
                <input value={formData.variables} onChange={(e) => setFormData({ ...formData, variables: e.target.value })} placeholder="name, email, role" className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border-light">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors">취소</button>
              <button onClick={handleSave} disabled={isPending} className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                {isPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
