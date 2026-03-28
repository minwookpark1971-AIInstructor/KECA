"use client";

import { useState } from "react";
import { roleLabels, roleBadgeColors } from "@/lib/mock-auth";
import { UserCheck, UserX, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export default function MembersClient({ members }: { members: Profile[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = members.filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    if (search && !u.name.includes(search) && !u.email.includes(search)) return false;
    return true;
  });

  const handleApprove = (userId: string) => alert(`목업: ${userId} 승인 처리`);
  const handleChangeRole = (userId: string, role: string) => alert(`목업: ${userId} → ${role} 변경`);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">회원관리</h1>

      {/* 필터 + 검색 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-white border border-border-light rounded-lg p-1">
          {[
            { key: "all", label: "전체" },
            { key: "pending", label: "승인대기" },
            { key: "approved", label: "승인완료" },
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
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">{user.created_at}</td>
                  <td className="px-4 py-3 text-center">
                    {user.role === "pending" ? (
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success text-xs font-medium rounded-md hover:bg-success/20 transition-colors"
                      >
                        <UserCheck size={12} /> 승인
                      </button>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="text-xs border border-border-light rounded-md px-2 py-1 focus:outline-none"
                      >
                        <option value="approved">승인완료</option>
                        <option value="member">정회원</option>
                        <option value="instructor">강사</option>
                        <option value="admin">관리자</option>
                      </select>
                    )}
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
