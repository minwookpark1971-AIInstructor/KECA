"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageSquare, XCircle, Users, X } from "lucide-react";

interface GroupItem {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
}

interface Props {
  selectedCount: number;
  selectedIds: Set<string>;
  onClearSelection: () => void;
}

export default function MemberActionBar({ selectedCount, selectedIds, onClearSelection }: Props) {
  const router = useRouter();
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [allGroups, setAllGroups] = useState<GroupItem[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [addingToGroup, setAddingToGroup] = useState(false);
  const [groupMsg, setGroupMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleEmailSend = () => {
    sessionStorage.setItem("marketing_recipients", JSON.stringify([...selectedIds]));
    router.push("/admin/marketing/email");
  };

  const handleKakaoSend = () => {
    sessionStorage.setItem("marketing_recipients", JSON.stringify([...selectedIds]));
    router.push("/admin/marketing/kakao");
  };

  const handleOpenGroupModal = async () => {
    setShowGroupModal(true);
    setSelectedGroupId(null);
    setGroupMsg(null);
    setGroupsLoading(true);
    try {
      const res = await fetch("/api/marketing/groups");
      const data = await res.json();
      setAllGroups(data.groups || []);
    } catch {
      setGroupMsg({ type: "error", text: "그룹 목록을 불러오지 못했습니다." });
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleAddToGroup = async () => {
    if (!selectedGroupId) return;
    setAddingToGroup(true);
    setGroupMsg(null);
    try {
      const res = await fetch("/api/marketing/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroupId,
          memberIds: [...selectedIds],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "추가 실패");
      setGroupMsg({ type: "success", text: `${data.memberCount}명의 그룹 회원이 업데이트되었습니다.` });
      setTimeout(() => {
        setShowGroupModal(false);
      }, 1500);
    } catch (err) {
      setGroupMsg({ type: "error", text: err instanceof Error ? err.message : "그룹 추가에 실패했습니다." });
    } finally {
      setAddingToGroup(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-40 bg-white border-t border-border shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-sm font-medium text-text">
            <span className="text-primary font-bold">{selectedCount}</span>명 선택됨
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmailSend}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Mail size={15} />
              이메일 발송
            </button>
            <button
              onClick={handleKakaoSend}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <MessageSquare size={15} />
              카카오톡 발송
            </button>
            <button
              onClick={handleOpenGroupModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Users size={15} />
              수신 그룹에 추가
            </button>
            <button
              onClick={onClearSelection}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              <XCircle size={15} />
              선택 해제
            </button>
          </div>
        </div>
      </div>

      {/* 수신 그룹 선택 모달 */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">수신 그룹에 추가</h3>
              <button onClick={() => setShowGroupModal(false)} className="p-1 text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {groupMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${groupMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {groupMsg.text}
                </div>
              )}

              <p className="text-sm text-text-muted mb-3">
                선택한 {selectedCount}명의 회원을 추가할 그룹을 선택해주세요.
              </p>

              {groupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : allGroups.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">등록된 수신 그룹이 없습니다. 먼저 그룹을 생성해주세요.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allGroups.map((group) => (
                    <label
                      key={group.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${selectedGroupId === group.id ? "border-primary bg-primary/5" : "border-border-light hover:bg-surface"}`}
                    >
                      <input
                        type="radio"
                        name="groupSelect"
                        value={group.id}
                        checked={selectedGroupId === group.id}
                        onChange={() => setSelectedGroupId(group.id)}
                        className="text-primary focus:ring-primary/20"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text">{group.name}</p>
                        {group.description && <p className="text-xs text-text-muted">{group.description}</p>}
                      </div>
                      <span className="text-xs text-text-muted">{group.member_count || 0}명</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 p-5 border-t border-border-light">
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 px-4 py-2.5 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddToGroup}
                disabled={!selectedGroupId || addingToGroup}
                className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {addingToGroup ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
