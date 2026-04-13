"use client";

import { useRouter } from "next/navigation";
import { Mail, MessageSquare, XCircle } from "lucide-react";

interface Props {
  selectedCount: number;
  selectedIds: Set<string>;
  onClearSelection: () => void;
}

export default function MemberActionBar({ selectedCount, selectedIds, onClearSelection }: Props) {
  const router = useRouter();

  const handleEmailSend = () => {
    sessionStorage.setItem("marketing_recipients", JSON.stringify([...selectedIds]));
    router.push("/admin/marketing/email");
  };

  const handleKakaoSend = () => {
    sessionStorage.setItem("marketing_recipients", JSON.stringify([...selectedIds]));
    router.push("/admin/marketing/kakao");
  };

  if (selectedCount === 0) return null;

  return (
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
            onClick={onClearSelection}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-muted hover:text-text transition-colors"
          >
            <XCircle size={15} />
            선택 해제
          </button>
        </div>
      </div>
    </div>
  );
}
