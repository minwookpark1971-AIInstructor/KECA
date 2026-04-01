"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { User, Eye, EyeOff, Edit2, UserX, Check, X, Pencil } from "lucide-react";
import { demoteInstructor, updateInstructor } from "@/lib/supabase/mutations";
import type { Profile } from "@/types";

export default function InstructorsAdminClient({ instructors }: { instructors: Profile[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleDemote = (inst: Profile) => {
    if (!confirm(`"${inst.name}" 강사를 해제하시겠습니까?\n회원 계정과 프로필 데이터는 유지됩니다.`)) return;
    startTransition(async () => {
      try {
        await demoteInstructor(inst.id);
        setMsg({ type: "success", text: `${inst.name} 강사가 해제되었습니다.` });
      } catch {
        setMsg({ type: "error", text: "강사 해제에 실패했습니다." });
      }
    });
  };

  const startEditSpecialties = (inst: Profile) => {
    setEditingId(inst.id);
    setEditValue((inst.specialties || []).join(", "));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveSpecialties = (inst: Profile) => {
    const newSpecialties = editValue.split(",").map((s) => s.trim()).filter(Boolean);
    startTransition(async () => {
      try {
        await updateInstructor(inst.id, { specialties: newSpecialties });
        setMsg({ type: "success", text: `${inst.name} 강사의 전문분야가 저장되었습니다.` });
        setEditingId(null);
      } catch {
        setMsg({ type: "error", text: "전문분야 저장에 실패했습니다." });
      }
    });
  };

  return (
    <>
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>
      )}

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-left px-4 py-3 font-medium">강사</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">전문분야</th>
                <th className="text-center px-4 py-3 font-medium">프로필 공개</th>
                <th className="text-center px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {instructors.map((inst) => (
                <tr key={inst.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                        {inst.profile_image_url ? (
                          <img src={inst.profile_image_url} alt={inst.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={14} className="text-purple-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text">{inst.name}</p>
                        <p className="text-xs text-text-muted">{inst.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {editingId === inst.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="AI교육, 데이터분석, ..."
                          className="flex-1 min-w-[200px] px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveSpecialties(inst);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <button
                          onClick={() => saveSpecialties(inst)}
                          disabled={isPending}
                          className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                          title="저장"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-text-muted hover:bg-surface rounded"
                          title="취소"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1">
                          {(inst.specialties || []).length > 0 ? (
                            inst.specialties!.map((s) => (
                              <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">{s}</span>
                            ))
                          ) : (
                            <span className="text-xs text-text-muted">미설정</span>
                          )}
                        </div>
                        <button
                          onClick={() => startEditSpecialties(inst)}
                          className="p-1 text-text-muted hover:text-primary rounded shrink-0"
                          title="전문분야 수정"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inst.is_profile_public ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success"><Eye size={12} /> 공개</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-text-muted"><EyeOff size={12} /> 비공개</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/instructors/${inst.id}`} className="p-1.5 text-text-muted hover:text-primary rounded" title="수정">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDemote(inst)}
                        disabled={isPending}
                        className="p-1.5 text-text-muted hover:text-orange-500 rounded disabled:opacity-50"
                        title="강사 해제"
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {instructors.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-text-muted">등록된 강사가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
