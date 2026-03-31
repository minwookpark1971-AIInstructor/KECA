"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteLecture } from "@/lib/supabase/mutations";
import { Pencil, Trash2, Users } from "lucide-react";
import type { Lecture } from "@/types";

const statusMap = {
  open: { label: "모집중", cls: "bg-green-100 text-green-700" },
  closed: { label: "마감", cls: "bg-gray-100 text-gray-500" },
  completed: { label: "완료", cls: "bg-blue-100 text-blue-600" },
};

export default function LecturesAdminClient({ lectures }: { lectures: Lecture[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 공고를 삭제하시겠습니까?\n관련 지원 내역도 함께 삭제됩니다.`)) return;
    setDeletingId(id);
    try {
      await deleteLecture(id);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setDeletingId(null);
    }
  }

  if (lectures.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border-light p-12 text-center text-text-sub">
        등록된 강의공고가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-border-light">
            <th className="text-left px-4 py-3 text-text-sub font-medium">제목</th>
            <th className="text-left px-4 py-3 text-text-sub font-medium hidden md:table-cell">강의일</th>
            <th className="text-center px-4 py-3 text-text-sub font-medium hidden sm:table-cell">모집/최대</th>
            <th className="text-left px-4 py-3 text-text-sub font-medium hidden lg:table-cell">마감일</th>
            <th className="text-left px-4 py-3 text-text-sub font-medium">상태</th>
            <th className="text-center px-4 py-3 text-text-sub font-medium">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {lectures.map((lec) => {
            const st = statusMap[lec.status];
            return (
              <tr key={lec.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-4 py-3 font-medium text-text max-w-[200px] truncate">
                  {lec.title}
                </td>
                <td className="px-4 py-3 text-text-sub hidden md:table-cell">
                  {lec.lecture_date ?? "-"}
                </td>
                <td className="px-4 py-3 text-center text-text-sub hidden sm:table-cell">
                  {lec.required_count}명 / {lec.max_applicants ?? "-"}명
                </td>
                <td className="px-4 py-3 text-text-sub hidden lg:table-cell">
                  {lec.deadline ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/lectures/${lec.id}/applicants`}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                      title="지원자 관리"
                    >
                      <Users size={15} />
                    </Link>
                    <Link
                      href={`/admin/lectures/${lec.id}`}
                      className="p-1.5 rounded-lg hover:bg-surface text-text-sub transition-colors"
                      title="편집"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => handleDelete(lec.id, lec.title)}
                      disabled={deletingId === lec.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors disabled:opacity-40"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
