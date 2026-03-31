"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createApplication, updateApplication } from "@/lib/supabase/mutations";
import type { Lecture, Profile } from "@/types";
import { X, Upload, FileText } from "lucide-react";

interface Props {
  lecture: Lecture;
  user: Profile;
}

type Step = 1 | 2 | 3 | 4;

const DEPOSIT_AMOUNT = 30000;
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ACCEPTED_EXTENSIONS = ".pdf,.hwpx,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function ApplyModal({ lecture, user }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openModal() {
    setOpen(true);
    setStep(1);
    setError(null);
  }

  function closeModal() {
    setOpen(false);
    setStep(1);
    setApplicationId(null);
    setCoverLetter("");
    setFiles([]);
    setError(null);
  }

  // 파일 추가
  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    // 개수 제한
    if (files.length + selected.length > MAX_FILES) {
      setError(`최대 ${MAX_FILES}개까지 업로드할 수 있습니다.`);
      return;
    }

    // 크기 제한
    const oversized = selected.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setError(`${oversized.name}: 파일 크기가 ${MAX_SIZE_MB}MB를 초과합니다.`);
      return;
    }

    // 중복 체크
    const existing = new Set(files.map((f) => f.name));
    const duplicates = selected.filter((f) => existing.has(f.name));
    if (duplicates.length > 0) {
      setError(`${duplicates[0].name}: 이미 추가된 파일입니다.`);
      return;
    }

    setError(null);
    setFiles((prev) => [...prev, ...selected]);

    // input 초기화 (같은 파일 재선택 가능하도록)
    if (fileRef.current) fileRef.current.value = "";
  }

  // 파일 삭제
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // Step 1 → Step 2: 지원 레코드 생성
  async function handleStep1Next() {
    setSubmitting(true);
    setError(null);
    try {
      const app = await createApplication(lecture.id, user.id);
      setApplicationId(app.id);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2 → Step 3: 서류 업로드 + 저장
  async function handleStep2Next() {
    if (!applicationId) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const documentUrls: { name: string; url: string }[] = [];

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, "_");
        const path = `applications/${applicationId}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("portfolios")
          .upload(path, file, { upsert: true });
        if (uploadError) throw new Error(`${file.name} 업로드 실패: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from("portfolios").getPublicUrl(path);
        documentUrls.push({ name: file.name, url: urlData.publicUrl });
      }

      await updateApplication(applicationId, {
        cover_letter: coverLetter,
        document_urls: documentUrls,
        // 하위호환: 첫 번째 파일 URL을 portfolio_url에도 저장
        ...(documentUrls.length > 0 ? { portfolio_url: documentUrls[0].url } : {}),
        status: "deposit_pending",
      });

      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "서류 저장 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  // Step 3: Toss 결제 처리
  async function handlePayment() {
    if (!applicationId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentType: "deposit",
          amount: DEPOSIT_AMOUNT,
          applicationId,
        }),
      });
      if (!res.ok) throw new Error("결제 정보 생성 실패");
      const { orderId } = await res.json();

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) throw new Error("결제 설정 오류");

      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: orderId });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: DEPOSIT_AMOUNT },
        orderId,
        orderName: `[예치금] ${lecture.title}`,
        successUrl: `${window.location.origin}/lectures/deposit-pay?lectureId=${lecture.id}`,
        failUrl: `${window.location.origin}/lectures/${lecture.id}?paymentFail=1`,
        card: {
          keyin: {
            selectableCardTypes: ["PERSONAL", "CORPORATE"],
          },
        },
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes("사용자가")) {
        setSubmitting(false);
        return;
      }
      setError(e instanceof Error ? e.message : "결제 중 오류가 발생했습니다.");
      setSubmitting(false);
    }
  }

  const stepLabels = ["프로필 확인", "서류 제출", "예치금 결제"];

  return (
    <>
      <button
        onClick={openModal}
        className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        강사 지원하기
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* 모달 */}
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* 상단 스텝 인디케이터 */}
            <div className="px-6 pt-6 pb-4 border-b border-border-light shrink-0">
              <div className="flex items-center gap-2 mb-4">
                {stepLabels.map((label, i) => {
                  const s = (i + 1) as Step;
                  const isActive = step === s;
                  const isDone = step > s;
                  return (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isDone
                            ? "bg-primary text-white"
                            : isActive
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isDone ? "✓" : s}
                      </div>
                      <span
                        className={`text-xs hidden sm:block ${
                          isActive ? "text-text font-medium" : "text-text-sub"
                        }`}
                      >
                        {label}
                      </span>
                      {i < stepLabels.length - 1 && (
                        <div className={`flex-1 h-px ${isDone ? "bg-primary" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <h2 className="text-lg font-bold text-text">
                {step === 1 && "내 프로필 확인"}
                {step === 2 && "서류 제출"}
                {step === 3 && "예치금 결제"}
                {step === 4 && "지원 완료"}
              </h2>
            </div>

            {/* 본문 (스크롤 가능) */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              {/* Step 1: 프로필 확인 */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-text-sub">아래 프로필 정보로 지원됩니다.</p>
                  <div className="bg-surface rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex gap-3">
                      <span className="text-text-sub/60 w-20 shrink-0">이름</span>
                      <span className="text-text font-medium">{user.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-text-sub/60 w-20 shrink-0">연락처</span>
                      <span className="text-text">{user.phone ?? "미등록"}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-text-sub/60 w-20 shrink-0">이메일</span>
                      <span className="text-text">{user.email}</span>
                    </div>
                    {user.specialties && user.specialties.length > 0 && (
                      <div className="flex gap-3">
                        <span className="text-text-sub/60 w-20 shrink-0">전문분야</span>
                        <span className="text-text">{user.specialties.join(", ")}</span>
                      </div>
                    )}
                    {user.bio && (
                      <div className="flex gap-3">
                        <span className="text-text-sub/60 w-20 shrink-0">소개</span>
                        <span className="text-text line-clamp-2">{user.bio}</span>
                      </div>
                    )}
                  </div>
                  <a
                    href="/mypage/profile"
                    target="_blank"
                    className="text-xs text-primary underline"
                  >
                    프로필 수정하기 →
                  </a>
                </div>
              )}

              {/* Step 2: 서류 제출 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                      자기소개서
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={4}
                      placeholder="강의 경력 및 지원 동기를 작성해주세요."
                      className="w-full border border-border-light rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      첨부 서류{" "}
                      <span className="text-text-sub font-normal">(선택, 최대 {MAX_FILES}개)</span>
                    </label>
                    <p className="text-xs text-text-muted mb-2">
                      이력서, 프로필, 강의계획서 등 | PDF, HWPX, PPT, Word, 이미지(JPG/PNG) | 각 {MAX_SIZE_MB}MB 이하
                    </p>

                    {/* 파일 목록 */}
                    {files.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {files.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2"
                          >
                            <FileText size={14} className="text-primary shrink-0" />
                            <span className="text-sm text-text truncate flex-1">{file.name}</span>
                            <span className="text-xs text-text-muted shrink-0">
                              {formatFileSize(file.size)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="text-text-muted hover:text-red-500 transition-colors shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 파일 추가 버튼 */}
                    <input
                      ref={fileRef}
                      type="file"
                      accept={ACCEPTED_EXTENSIONS}
                      multiple
                      onChange={handleFilesChange}
                      className="hidden"
                    />
                    {files.length < MAX_FILES && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full border border-dashed border-border-light rounded-lg px-4 py-3 text-sm text-text-sub hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                      >
                        <Upload size={14} />
                        파일 추가 ({files.length}/{MAX_FILES})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: 결제 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-surface rounded-lg p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-sub">공고</span>
                      <span className="text-text font-medium">{lecture.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-sub">예치금</span>
                      <span className="text-text font-semibold">
                        {DEPOSIT_AMOUNT.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    예치금은 미선발 시 3영업일 이내 전액 환불됩니다.
                  </div>
                </div>
              )}

              {/* Step 4: 완료 */}
              {step === 4 && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-green-600">✓</span>
                  </div>
                  <p className="font-semibold text-text mb-1">지원이 완료되었습니다!</p>
                  <p className="text-sm text-text-sub">
                    결과는 카카오 알림톡 및 이메일로 안내드립니다.
                  </p>
                </div>
              )}

              {error && (
                <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="px-6 pb-6 flex gap-3 shrink-0">
              {step < 4 && (
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-border-light rounded-lg text-sm text-text-sub hover:bg-surface transition-colors"
                >
                  취소
                </button>
              )}

              {step === 1 && (
                <button
                  onClick={handleStep1Next}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "처리 중..." : "다음"}
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={handleStep2Next}
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {uploading ? "업로드 중..." : "다음"}
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? "결제 중..." : `${DEPOSIT_AMOUNT.toLocaleString()}원 결제하기`}
                </button>
              )}

              {step === 4 && (
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
