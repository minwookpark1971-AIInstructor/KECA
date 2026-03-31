"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelApplication, deleteApplication } from "@/lib/supabase/mutations";
import { useToast } from "@/components/layout/Toast";
import { XCircle, Trash2 } from "lucide-react";

interface Props {
  applicationId: string;
  userId: string;
  mode: "cancel" | "delete";
}

export default function CancelButton({ applicationId, userId, mode }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("정말 지원을 취소하시겠습니까?\n취소 후에는 복구할 수 없습니다.")) return;
    setLoading(true);
    try {
      await cancelApplication(applicationId, userId);
      toast("success", "지원이 취소되었습니다.");
      router.push("/mypage/applications");
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "지원 취소 실패");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("지원 이력을 완전히 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.")) return;
    setLoading(true);
    try {
      await deleteApplication(applicationId, userId);
      toast("success", "지원 이력이 삭제되었습니다.");
      router.push("/mypage/applications");
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "delete") {
    return (
      <div className="text-center">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={16} />
          {loading ? "삭제 중..." : "지원 이력 삭제"}
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        <XCircle size={16} />
        {loading ? "취소 중..." : "지원 취소"}
      </button>
    </div>
  );
}
