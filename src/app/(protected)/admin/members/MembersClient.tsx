"use client";

import { useState, useTransition } from "react";
import { roleLabels, roleBadgeColors } from "@/lib/utils";
import { UserCheck, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { approveMember, changeUserRole, deleteMember } from "@/lib/supabase/mutations";
import type { Profile } from "@/types";

export default function MembersClient({ members }: { members: Profile[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // pending 회원별 승인 역할 선택 상태
  const [approveRoles, setApproveRoles] = useState<Record<string, string>>({});

  const filtered = members.filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    if (search && !u.name.includes(search) && !u.email.includes(search)) return false;
    return true;
  });

  const getApproveRole = (userId: string) => approveRoles[userId] || "associate";

  const handleApprove = (userId: string) => {
    const role = getApproveRole(userId);
    startTransition(async () => {
      try {
        await approveMember(userId, role);
        setMsg({ type: "success", text: `회원이 ${roleLabels[role] || role}(으)로 승인되었습니다.` });
      } catch {
        setMsg({ type: "error", text: "승인 처리에 실패했습니다." });
      }
    });
  };

  const handleChangeRole = (userId: string, role: string) => {
    startTransition(async () => {
      try {
        await changeUserRole(userId, role);
        setMsg({ type: "success", text: "역할이 변경되었습니다." });
      } catch {
        setMsg({ type: "error", text: "역할 변경에 실패했습니다." });
      }
    });
  };

  const handleDelete = (userId: string, userName: string) => {
    if (!confirm(`"${userName}" 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    startTransition(async () => {
      try {
        await deleteMember(userId);
        setMsg({ type: "success", text: "회원이 삭제되었습니다." });
      } catch {
        setMsg({ type: "error", text: "회원 삭제에 실패했습니다." });
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">회원관리</h1>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* 필터 + 검색 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-white border border-border-light rounded-lg p-1">
          {[
            { key: "all", label: "전체" },
            { key: "pending", label: "승인대기" },
            { key: "approved", label: "승인완료" },
            { key: "associate", label: "준회원" },
            { key: "member", label: "정회원" },
            { key: "instructor", label: "강사" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === f.key ? "bg-primary text-white" : "text-text-sub hover:bg-surface"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일 검색"
            className="w-full pl-9 pr-4 py-2 border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* 회원 테이블 */}
      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-light text-text-sub">
                <th className="text-left px-4 py-3 font-medium">이름</th>
                <th className="text-left px-4 py-3 font-medium">이메일</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">연락처</th>
                <th className="text-center px-4 py-3 font-medium">상태</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">가입일</th>
                <th className="text-center px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-text">{user.name}</td>
                  <td className="px-4 py-3 text-text-sub">{user.email}</td>
                  <td className="px-4 py-3 text-text-sub hidden sm:table-cell">{user.phone || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleBadgeColors[user.role]}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                    {new Date(user.created_at).toLocaleDateString("ko")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {user.role === "pending" ? (
                        <>
                          {/* 역할 선택 드롭다운 */}
                          <select
                            value={getApproveRole(user.id)}
                            onChange={(e) =>
                              setApproveRoles((prev) => ({ ...prev, [user.id]: e.target.value }))
                            }
                            className="text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            <option value="associate">준회원</option>
                            <option value="member">정회원</option>
                            <option value="instructor">강사</option>
                          </select>
                          {/* 승인 버튼 */}
                          <button
                            onClick={() => handleApprove(user.id)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-md hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            <UserCheck size={12} /> 승인
                          </button>
                        </>
                      ) : (
                        /* 역할 변경 드롭다운 */
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          disabled={isPending}
                          className="text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none disabled:opacity-50"
                        >
                          <option value="approved">승인완료</option>
                          <option value="associate">준회원</option>
                          <option value="member">정회원</option>
                          <option value="instructor">강사</option>
                          <option value="admin">관리자</option>
                        </select>
                      )}
                      {/* 삭제 버튼 (admin은 삭제 불가) */}
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={isPending}
                          className="p-1 text-text-muted hover:text-error rounded transition-colors disabled:opacity-50"
                          title="회원 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
