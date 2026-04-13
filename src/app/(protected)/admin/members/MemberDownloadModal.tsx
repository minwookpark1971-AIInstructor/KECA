"use client";

import { useState } from "react";
import { X, Download, FileSpreadsheet, FileText } from "lucide-react";
import { roleLabels } from "@/lib/utils";
import type { Profile } from "@/types";

const FIELD_OPTIONS = [
  { key: "name", label: "이름" },
  { key: "email", label: "이메일" },
  { key: "phone", label: "연락처" },
  { key: "role", label: "회원 상태" },
  { key: "is_instructor", label: "강사 여부" },
  { key: "created_at", label: "가입일" },
  { key: "profile_status", label: "프로필 상태" },
  { key: "marketing_email_agreed", label: "이메일 수신동의" },
] as const;

type FieldKey = (typeof FIELD_OPTIONS)[number]["key"];

interface Props {
  members: Profile[];
  filteredMembers: Profile[];
  currentFilter: string;
  onClose: () => void;
  onDownloaded?: (recordCount: number, format: string, fields: string[]) => void;
}

export default function MemberDownloadModal({
  members,
  filteredMembers,
  currentFilter,
  onClose,
  onDownloaded,
}: Props) {
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [scope, setScope] = useState<"filtered" | "all">("filtered");
  const [selectedFields, setSelectedFields] = useState<Set<FieldKey>>(
    new Set(["name", "email", "phone", "role", "created_at"])
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleField = (key: FieldKey) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const targetMembers = scope === "filtered" ? filteredMembers : members;

  const handleDownload = async () => {
    if (targetMembers.length === 0) return;
    setIsDownloading(true);

    try {
      const XLSX = await import("xlsx");
      const fields = Array.from(selectedFields);

      const rows = targetMembers.map((m) => {
        const row: Record<string, string> = {};
        for (const f of fields) {
          switch (f) {
            case "name":
              row["이름"] = m.name;
              break;
            case "email":
              row["이메일"] = m.email;
              break;
            case "phone":
              row["연락처"] = m.phone || "";
              break;
            case "role":
              row["회원상태"] = roleLabels[m.role] || m.role;
              break;
            case "is_instructor":
              row["강사여부"] = m.is_instructor ? "강사" : "-";
              break;
            case "created_at":
              row["가입일"] = new Date(m.created_at).toLocaleDateString("ko");
              break;
            case "profile_status":
              row["프로필상태"] = m.profile_status || "미작성";
              break;
            case "marketing_email_agreed":
              row["이메일수신동의"] = m.marketing_email_agreed ? "동의" : "미동의";
              break;
          }
        }
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "회원목록");

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `KECA_회원목록_${dateStr}`;

      if (format === "xlsx") {
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      } else {
        // CSV with UTF-8 BOM for Korean characters
        const csv = XLSX.utils.sheet_to_csv(ws);
        const bom = "\uFEFF";
        const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      onDownloaded?.(rows.length, format, fields);
      onClose();
    } catch (err) {
      console.error("다운로드 실패:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h3 className="text-lg font-bold text-text">회원목록 다운로드</h3>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 파일 형식 */}
          <div>
            <p className="text-sm font-medium text-text mb-2">파일 형식</p>
            <div className="flex gap-3">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${format === "xlsx" ? "border-primary bg-primary/5 text-primary" : "border-border-light text-text-sub hover:bg-surface"}`}>
                <input type="radio" name="format" value="xlsx" checked={format === "xlsx"} onChange={() => setFormat("xlsx")} className="hidden" />
                <FileSpreadsheet size={16} />
                <span className="text-sm font-medium">Excel (.xlsx)</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors ${format === "csv" ? "border-primary bg-primary/5 text-primary" : "border-border-light text-text-sub hover:bg-surface"}`}>
                <input type="radio" name="format" value="csv" checked={format === "csv"} onChange={() => setFormat("csv")} className="hidden" />
                <FileText size={16} />
                <span className="text-sm font-medium">CSV (.csv)</span>
              </label>
            </div>
          </div>

          {/* 포함 항목 */}
          <div>
            <p className="text-sm font-medium text-text mb-2">포함 항목</p>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface cursor-pointer hover:bg-border-light transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedFields.has(opt.key)}
                    onChange={() => toggleField(opt.key)}
                    className="rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm text-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 다운로드 범위 */}
          <div>
            <p className="text-sm font-medium text-text mb-2">다운로드 범위</p>
            <div className="flex gap-3">
              <label className={`flex-1 text-center px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${scope === "filtered" ? "border-primary bg-primary/5 text-primary" : "border-border-light text-text-sub hover:bg-surface"}`}>
                <input type="radio" name="scope" value="filtered" checked={scope === "filtered"} onChange={() => setScope("filtered")} className="hidden" />
                <span className="text-sm font-medium">현재 필터 ({filteredMembers.length}명)</span>
              </label>
              <label className={`flex-1 text-center px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${scope === "all" ? "border-primary bg-primary/5 text-primary" : "border-border-light text-text-sub hover:bg-surface"}`}>
                <input type="radio" name="scope" value="all" checked={scope === "all"} onChange={() => setScope("all")} className="hidden" />
                <span className="text-sm font-medium">전체 회원 ({members.length}명)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-border-light">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading || targetMembers.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {isDownloading ? "다운로드 중..." : `다운로드 (${targetMembers.length}명)`}
          </button>
        </div>
      </div>
    </div>
  );
}
