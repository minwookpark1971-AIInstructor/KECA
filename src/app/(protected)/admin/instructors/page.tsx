import Link from "next/link";
import { getMembersForAdmin } from "@/lib/supabase/queries";
import { User, Eye, EyeOff, Plus } from "lucide-react";

export default async function AdminInstructorsPage() {
  const members = await getMembersForAdmin();
  const instructors = members.filter((u) => u.role === "instructor");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">강사관리</h1>
        <Link
          href="/admin/instructors/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> 강사 등록
        </Link>
      </div>

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
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <User size={14} className="text-purple-600" />
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
                    <button className="text-xs text-primary hover:underline">프로그램 배정</button>
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
    </div>
  );
}
