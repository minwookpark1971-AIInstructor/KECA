"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { User, Eye, EyeOff, Edit2, Trash2 } from "lucide-react";
import { deleteInstructor } from "@/lib/supabase/mutations";
import type { Profile } from "@/types";

export default function InstructorsAdminClient({ instructors }: { instructors: Profile[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDelete = (inst: Profile) => {
    if (!confirm(`"${inst.name}" 강사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    startTransition(async () => {
      try {
        await deleteInstructor(inst.id);
        setMsg({ type: "success", text: `${inst.name} 강사가 삭제되었습니다.` });
      } catch {
        setMsg({ type: "error", text: "삭제에 실패했습니다." });
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
                    <div className="flex flex-wrap gap-1">
                      {(inst.specialties || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">{s}</span>
                      ))}
                    </div>
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
                        onClick={() => handleDelete(inst)}
                        disabled={isPending}
                        className="p-1.5 text-text-muted hover:text-error rounded disabled:opacity-50"
                        title="삭제"
                      >
                        <Trash2 size={14} />
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
