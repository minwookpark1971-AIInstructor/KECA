"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelApplication } from "@/lib/supabase/mutations";
import { useToast } from "@/components/layout/Toast";
import { XCircle } from "lucide-react";

export default function LectureCancelButton({ applicationId, userId }: { applicationId: string; userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("정말 지원을 취소하시겠습니까?\n취소 후에는 복구할 수 없습니다.")) return;
    setLoading(true);
    try {
      await cancelApplication(applicationId, userId);
      toast("success", "지원이 취소되었습니다.");
      router.refresh();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "지원 취소 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
    >
      <XCircle size={14} />
      {loading ? "취소 중..." : "지원 취소"}
    </button>
  );
}
