"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Plus, Trash2, X, Users } from "lucide-react";
import Link from "next/link";
import { createMarketingGroup, deleteMarketingGroup } from "@/lib/supabase/mutations";
import type { MarketingGroup } from "@/types";

const roleOptions = [
  { value: "pending", label: "승인대기" },
  { value: "approved", label: "승인완료" },
  { value: "associate", label: "준회원" },
  { value: "member", label: "정회원" },
  { value: "admin", label: "관리자" },
];

export default function GroupsClient({ groups }: { groups: MarketingGroup[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [instructorOnly, setInstructorOnly] = useState(false);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setMsg({ type: "error", text: "그룹명을 입력해주세요." });
      return;
    }

    startTransition(async () => {
      try {
        await createMarketingGroup({
          name: name.trim(),
          description: description.trim() || undefined,
          filter_criteria: {
            roles: [...selectedRoles],
            is_instructor: instructorOnly || undefined,
          },
        });
        setMsg({ type: "success", text: "수신 그룹이 생성되었습니다." });
        setShowModal(false);
        setName("");
        setDescription("");
        setSelectedRoles(new Set());
        setInstructorOnly(false);
      } catch {
        setMsg({ type: "error", text: "생성에 실패했습니다." });
      }
    });
  };

  const handleDelete = (id: string, groupName: string) => {
    if (!confirm(`"${groupName}" 그룹을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteMarketingGroup(id);
        setMsg({ type: "success", text: "그룹이 삭제되었습니다." });
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
          <h1 className="text-2xl font-bold text-text">수신 그룹 관리</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={15} />
          새 그룹
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-text-muted col-span-full text-center py-12">등록된 수신 그룹이 없습니다.</p>
        ) : (
          groups.map((g) => {
            const criteria = g.filter_criteria as { roles?: string[]; is_instructor?: boolean } | null;
            return (
              <div key={g.id} className="bg-white border border-border-light rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{g.name}</p>
                      {g.description && <p className="text-xs text-text-muted">{g.description}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id, g.name)}
                    disabled={isPending}
                    className="p-1 text-text-muted hover:text-error rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {criteria?.roles?.map((r) => (
                    <span key={r} className="px-2 py-0.5 text-xs bg-surface rounded-full text-text-sub">{r}</span>
                  ))}
                  {criteria?.is_instructor && (
                    <span className="px-2 py-0.5 text-xs bg-purple-50 rounded-full text-purple-600">강사</span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-3">
                  {new Date(g.created_at).toLocaleDateString("ko")} 생성
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* 생성 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">새 수신 그룹</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-text-muted hover:text-text"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-text">그룹명</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 정회원 전체" className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-text">설명</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="그룹에 대한 간단한 설명" className="w-full mt-1 px-3 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-text mb-2 block">회원 역할 필터</label>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-lg cursor-pointer hover:bg-border-light">
                      <input type="checkbox" checked={selectedRoles.has(opt.value)} onChange={() => toggleRole(opt.value)} className="rounded border-border text-primary focus:ring-primary/20" />
                      <span className="text-sm text-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg cursor-pointer">
                <input type="checkbox" checked={instructorOnly} onChange={(e) => setInstructorOnly(e.target.checked)} className="rounded border-border text-primary focus:ring-primary/20" />
                <span className="text-sm text-text">강사만 포함</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 border-t border-border-light">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors">취소</button>
              <button onClick={handleCreate} disabled={isPending} className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                {isPending ? "생성 중..." : "생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
