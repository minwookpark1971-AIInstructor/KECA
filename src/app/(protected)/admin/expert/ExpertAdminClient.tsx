"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { BookOpen, Edit2, Trash2 } from "lucide-react";
import { deleteProgram } from "@/lib/supabase/mutations";
import type { Program, Category } from "@/types";

export default function ExpertAdminClient({ programs, categories }: { programs: Program[]; categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const handleDelete = (prog: Program) => {
    if (!confirm(`"${prog.title}" 과정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    startTransition(async () => {
      try {
        await deleteProgram(prog.id);
        setMsg({ type: "success", text: `"${prog.title}" 과정이 삭제되었습니다.` });
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

      {programs.length > 0 ? (
        <div className="space-y-3">
          {programs.map((prog) => {
            const cat = getCategoryById(prog.category_id || "");
            return (
              <div key={prog.id} className="bg-white border border-border-light rounded-xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text">{prog.title}</h3>
                  <p className="text-xs text-text-muted">{cat?.name} · {prog.program_type === "expert" ? "전문가과정" : "자격증과정"}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${prog.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {prog.status === "published" ? "공개" : "초안"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/admin/programs/${prog.id}`} className="p-1.5 text-text-muted hover:text-primary rounded" title="수정">
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(prog)}
                    disabled={isPending}
                    className="p-1.5 text-text-muted hover:text-error rounded disabled:opacity-50"
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-border-light rounded-xl p-12 text-center">
          <p className="text-sm text-text-muted">등록된 전문가과정이 없습니다.</p>
        </div>
      )}
    </>
  );
}
