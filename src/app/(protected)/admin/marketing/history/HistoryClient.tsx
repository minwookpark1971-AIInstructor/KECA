"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Trash2, Download, Eye, X, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteMarketingCampaigns } from "@/lib/supabase/mutations";
import type { MarketingCampaign } from "@/types";

const channelLabels: Record<string, string> = {
  email: "이메일",
  kakao_alimtalk: "알림톡",
  kakao_brand_message: "브랜드 메시지",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "초안", color: "bg-gray-100 text-gray-700" },
  scheduled: { label: "예약됨", color: "bg-blue-100 text-blue-700" },
  sending: { label: "발송중", color: "bg-yellow-100 text-yellow-700" },
  sent: { label: "발송완료", color: "bg-green-100 text-green-700" },
  failed: { label: "실패", color: "bg-red-100 text-red-700" },
  cancelled: { label: "취소", color: "bg-gray-100 text-gray-500" },
};

interface DetailLog {
  id: string;
  status: string;
  error_message?: string;
  created_at: string;
  recipient?: { name?: string; email?: string; phone?: string };
}

export default function HistoryClient({ campaigns }: { campaigns: MarketingCampaign[] }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [detailLogs, setDetailLogs] = useState<DetailLog[]>([]);
  const [detailCampaign, setDetailCampaign] = useState<MarketingCampaign | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Download modal states
  const [downloadFormat, setDownloadFormat] = useState<"xlsx" | "csv">("xlsx");
  const [downloadChannelFilters, setDownloadChannelFilters] = useState<Set<string>>(new Set(["email", "kakao_alimtalk", "kakao_brand_message"]));
  const [downloadStatusFilters, setDownloadStatusFilters] = useState<Set<string>>(new Set(["draft", "scheduled", "sending", "sent", "failed", "cancelled"]));

  // Toggle individual selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.size === campaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(campaigns.map((c) => c.id)));
    }
  };

  // Delete single campaign
  const handleDeleteSingle = (id: string) => {
    if (!confirm("이 발송 이력을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      try {
        await deleteMarketingCampaigns([id]);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setMsg({ type: "success", text: "삭제되었습니다." });
      } catch {
        setMsg({ type: "error", text: "삭제에 실패했습니다." });
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (!confirm(`${selectedIds.size}건의 발송 이력을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      try {
        await deleteMarketingCampaigns(Array.from(selectedIds));
        setSelectedIds(new Set());
        setMsg({ type: "success", text: `${selectedIds.size}건이 삭제되었습니다.` });
      } catch {
        setMsg({ type: "error", text: "삭제에 실패했습니다." });
      }
    });
  };

  // Open detail modal
  const openDetail = async (campaignId: string) => {
    setShowDetailId(campaignId);
    setDetailLoading(true);
    setDetailLogs([]);
    setDetailCampaign(null);
    try {
      const res = await fetch(`/api/marketing/campaign-detail?campaignId=${campaignId}`);
      const data = await res.json();
      setDetailCampaign(data.campaign || null);
      setDetailLogs(data.logs || []);
    } catch {
      setMsg({ type: "error", text: "상세 정보를 불러오지 못했습니다." });
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle download filter
  const toggleDownloadChannel = (ch: string) => {
    setDownloadChannelFilters((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  const toggleDownloadStatus = (st: string) => {
    setDownloadStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(st)) next.delete(st);
      else next.add(st);
      return next;
    });
  };

  // Download handler
  const handleDownload = async () => {
    const filtered = campaigns.filter(
      (c) => downloadChannelFilters.has(c.channel) && downloadStatusFilters.has(c.status)
    );

    if (filtered.length === 0) {
      setMsg({ type: "error", text: "필터 조건에 맞는 데이터가 없습니다." });
      return;
    }

    const rows = filtered.map((c) => ({
      "제목": c.title || c.subject || "(제목 없음)",
      "채널": channelLabels[c.channel] || c.channel,
      "상태": statusConfig[c.status]?.label || c.status,
      "수신자": c.total_recipients,
      "성공": c.success_count,
      "실패": c.fail_count,
      "발송일": c.sent_at ? new Date(c.sent_at).toLocaleString("ko") : "-",
    }));

    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "발송이력");

      if (downloadFormat === "xlsx") {
        XLSX.writeFile(wb, `발송이력_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } else {
        XLSX.writeFile(wb, `발송이력_${new Date().toISOString().slice(0, 10)}.csv`, { bookType: "csv" });
      }
      setShowDownloadModal(false);
    } catch {
      setMsg({ type: "error", text: "다운로드에 실패했습니다." });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing" className="p-1.5 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-text-sub" />
          </Link>
          <h1 className="text-2xl font-bold text-text">발송 이력</h1>
        </div>
        <button
          onClick={() => setShowDownloadModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface text-text-sub text-sm font-medium rounded-lg hover:bg-border-light transition-colors"
        >
          <Download size={15} />
          다운로드
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white border border-border-light rounded-xl overflow-hidden">
        {campaigns.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-12">발송 이력이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border-light text-text-sub">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === campaigns.length && campaigns.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left px-5 py-3 font-medium">제목</th>
                  <th className="text-center px-3 py-3 font-medium">채널</th>
                  <th className="text-center px-3 py-3 font-medium">상태</th>
                  <th className="text-center px-3 py-3 font-medium">수신자</th>
                  <th className="text-center px-3 py-3 font-medium hidden sm:table-cell">성공</th>
                  <th className="text-center px-3 py-3 font-medium hidden sm:table-cell">실패</th>
                  <th className="text-right px-3 py-3 font-medium hidden md:table-cell">발송일</th>
                  <th className="text-center px-3 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {campaigns.map((c) => {
                  const st = statusConfig[c.status] || { label: c.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={c.id} className={cn("hover:bg-surface/50", selectedIds.has(c.id) && "bg-primary/5")}>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-5 py-3 font-medium text-text">{c.title || c.subject || "(제목 없음)"}</td>
                      <td className="px-3 py-3 text-center text-xs text-text-sub">
                        {channelLabels[c.channel] || c.channel}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-text-sub">{c.total_recipients}명</td>
                      <td className="px-3 py-3 text-center text-green-600 hidden sm:table-cell">{c.success_count}</td>
                      <td className="px-3 py-3 text-center text-red-500 hidden sm:table-cell">{c.fail_count}</td>
                      <td className="px-3 py-3 text-right text-text-muted text-xs hidden md:table-cell">
                        {c.sent_at ? new Date(c.sent_at).toLocaleString("ko") : "-"}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openDetail(c.id)}
                            className="p-1 text-text-muted hover:text-blue-600 rounded"
                            title="상세보기"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(c.id)}
                            disabled={isPending}
                            className="p-1 text-text-muted hover:text-error rounded"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk delete bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-border-light shadow-xl rounded-2xl px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-text">{selectedIds.size}건 선택</span>
          <button
            onClick={handleBulkDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            선택 삭제
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-text-muted hover:text-text"
          >
            취소
          </button>
        </div>
      )}

      {/* Download modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">이력 다운로드</h3>
              <button onClick={() => setShowDownloadModal(false)} className="p-1 text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Format */}
              <div>
                <p className="text-sm font-medium text-text mb-2">파일 형식</p>
                <div className="flex gap-3">
                  {(["xlsx", "csv"] as const).map((f) => (
                    <label
                      key={f}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl border text-center text-sm cursor-pointer transition-colors",
                        downloadFormat === f ? "border-primary bg-primary/5 font-medium" : "border-border-light hover:bg-surface"
                      )}
                    >
                      <input type="radio" name="format" value={f} checked={downloadFormat === f} onChange={() => setDownloadFormat(f)} className="hidden" />
                      {f.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              {/* Channel filter */}
              <div>
                <p className="text-sm font-medium text-text mb-2">채널 필터</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(channelLabels).map(([key, label]) => (
                    <label
                      key={key}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer border transition-colors",
                        downloadChannelFilters.has(key) ? "border-primary bg-primary/5 text-primary" : "border-border-light text-text-muted"
                      )}
                    >
                      <input type="checkbox" checked={downloadChannelFilters.has(key)} onChange={() => toggleDownloadChannel(key)} className="hidden" />
                      {downloadChannelFilters.has(key) && <Check size={12} />}
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <p className="text-sm font-medium text-text mb-2">상태 필터</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, { label }]) => (
                    <label
                      key={key}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer border transition-colors",
                        downloadStatusFilters.has(key) ? "border-primary bg-primary/5 text-primary" : "border-border-light text-text-muted"
                      )}
                    >
                      <input type="checkbox" checked={downloadStatusFilters.has(key)} onChange={() => toggleDownloadStatus(key)} className="hidden" />
                      {downloadStatusFilters.has(key) && <Check size={12} />}
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border-light">
              <button onClick={() => setShowDownloadModal(false)} className="flex-1 px-4 py-2.5 text-sm text-text-sub bg-surface rounded-xl hover:bg-border-light transition-colors">
                취소
              </button>
              <button onClick={handleDownload} className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors">
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border-light">
              <h3 className="text-lg font-bold text-text">발송 상세</h3>
              <button
                onClick={() => { setShowDetailId(null); setDetailLogs([]); setDetailCampaign(null); }}
                className="p-1 text-text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* Campaign summary */}
                  {detailCampaign && (
                    <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-surface rounded-xl">
                        <p className="text-xs text-text-muted">제목</p>
                        <p className="text-sm font-medium text-text mt-0.5">{detailCampaign.title || detailCampaign.subject || "-"}</p>
                      </div>
                      <div className="p-3 bg-surface rounded-xl">
                        <p className="text-xs text-text-muted">채널</p>
                        <p className="text-sm font-medium text-text mt-0.5">{channelLabels[detailCampaign.channel] || detailCampaign.channel}</p>
                      </div>
                      <div className="p-3 bg-surface rounded-xl">
                        <p className="text-xs text-text-muted">상태</p>
                        <p className="text-sm font-medium text-text mt-0.5">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig[detailCampaign.status]?.color || ""}`}>
                            {statusConfig[detailCampaign.status]?.label || detailCampaign.status}
                          </span>
                        </p>
                      </div>
                      <div className="p-3 bg-surface rounded-xl">
                        <p className="text-xs text-text-muted">발송일</p>
                        <p className="text-sm font-medium text-text mt-0.5">
                          {detailCampaign.sent_at ? new Date(detailCampaign.sent_at).toLocaleString("ko") : "-"}
                        </p>
                      </div>
                      <div className="p-3 bg-surface rounded-xl">
                        <p className="text-xs text-text-muted">전체 수신자</p>
                        <p className="text-sm font-medium text-text mt-0.5">{detailCampaign.total_recipients}명</p>
                      </div>
                      <div className="p-3 bg-surface rounded-xl">
                        <p className="text-xs text-text-muted">성공</p>
                        <p className="text-sm font-medium text-green-600 mt-0.5">{detailCampaign.success_count}</p>
                      </div>
                      <div className="p-3 bg-surface rounded-xl">
                        <p className="text-xs text-text-muted">실패</p>
                        <p className="text-sm font-medium text-red-500 mt-0.5">{detailCampaign.fail_count}</p>
                      </div>
                    </div>
                  )}

                  {/* Send logs table */}
                  <div>
                    <p className="text-sm font-medium text-text mb-3">수신자별 발송 결과</p>
                    {detailLogs.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-8">발송 로그가 없습니다.</p>
                    ) : (
                      <div className="overflow-x-auto border border-border-light rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-surface border-b border-border-light text-text-sub">
                              <th className="text-left px-4 py-2.5 font-medium">이름</th>
                              <th className="text-left px-4 py-2.5 font-medium">이메일/연락처</th>
                              <th className="text-center px-4 py-2.5 font-medium">상태</th>
                              <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">오류</th>
                              <th className="text-right px-4 py-2.5 font-medium hidden md:table-cell">발송시각</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-light">
                            {detailLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-surface/50">
                                <td className="px-4 py-2.5 text-text">{log.recipient?.name || "-"}</td>
                                <td className="px-4 py-2.5 text-text-sub">{log.recipient?.email || log.recipient?.phone || "-"}</td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className={cn(
                                    "px-2 py-0.5 text-xs font-medium rounded-full",
                                    log.status === "sent" || log.status === "delivered" ? "bg-green-100 text-green-700" :
                                    log.status === "failed" || log.status === "bounced" ? "bg-red-100 text-red-700" :
                                    log.status === "opened" || log.status === "clicked" ? "bg-blue-100 text-blue-700" :
                                    "bg-gray-100 text-gray-700"
                                  )}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-xs text-red-500 hidden sm:table-cell">{log.error_message || "-"}</td>
                                <td className="px-4 py-2.5 text-right text-xs text-text-muted hidden md:table-cell">
                                  {new Date(log.created_at).toLocaleString("ko")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
