/**
 * 카카오 비즈메시지 발송 — 솔라피(Solapi) SDK 연동
 *
 * 사전 조건:
 * - 솔라피(solapi.com) 가입 + API Key/Secret 발급
 * - 카카오 비즈니스 채널 개설 + 솔라피에서 채널 연동 (PFID 발급)
 * - 알림톡 템플릿 등록 + 카카오 검수 승인
 * - 환경변수: SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_PFID
 */

import { SolapiMessageService } from "solapi";

// ─── 솔라피 클라이언트 ───

function getSolapiClient(): SolapiMessageService | null {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;

  if (!apiKey || !apiSecret) {
    const missing = [
      !apiKey && "SOLAPI_API_KEY",
      !apiSecret && "SOLAPI_API_SECRET",
    ]
      .filter(Boolean)
      .join(", ");
    console.warn(`[Solapi] 환경변수 미설정 (${missing}) — 발송을 스킵합니다.`);
    return null;
  }

  return new SolapiMessageService(apiKey, apiSecret);
}

const PFID = () => process.env.SOLAPI_PFID || "";

// 솔라피 예외에서 실패 사유/코드를 최대한 추출
function extractSolapiError(err: unknown): string {
  if (!err) return "알 수 없는 오류";
  if (err instanceof Error) {
    const anyErr = err as Error & {
      failedMessageList?: Array<{ statusCode?: string; statusMessage?: string }>;
      errorCode?: string;
      errorMessage?: string;
    };
    const failed = anyErr.failedMessageList?.[0];
    if (failed?.statusCode || failed?.statusMessage) {
      return `${failed.statusCode || ""} ${failed.statusMessage || ""}`.trim();
    }
    if (anyErr.errorCode || anyErr.errorMessage) {
      return `${anyErr.errorCode || ""} ${anyErr.errorMessage || ""}`.trim();
    }
    return anyErr.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// ─── 전화번호 정규화 ───

export function normalizePhoneNumber(phone: string): string {
  // 하이픈, 공백, 괄호 제거 → 숫자만 남김
  return phone.replace(/[^0-9]/g, "");
}

// ─── 알림톡 발송 ───

export async function sendAlimtalkViaSolapi(
  phone: string,
  templateId: string,
  variables: Record<string, string>,
  buttons?: Array<{ buttonName: string; buttonType: string; linkMo?: string; linkPc?: string }>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getSolapiClient();
  if (!client) {
    console.log("[Solapi Alimtalk] SDK 미설정 — 발송 스킵:", { phone, templateId, variables });
    return { success: false, error: "Solapi not configured" };
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const pfId = PFID();
  const senderNumber = process.env.SOLAPI_SENDER_NUMBER;

  if (!pfId) {
    return { success: false, error: "SOLAPI_PFID 환경변수 미설정" };
  }
  if (!senderNumber) {
    return {
      success: false,
      error:
        "SOLAPI_SENDER_NUMBER 미설정 — 솔라피에 사전 등록된 발신번호가 필요합니다.",
    };
  }

  try {
    const messageParams: Record<string, unknown> = {
      to: normalizedPhone,
      from: normalizePhoneNumber(senderNumber),
      type: "ATA", // 알림톡 타입 명시 — 미지정 시 SMS 자동 폴백 가능
      kakaoOptions: {
        pfId,
        templateId,
        variables,
        disableSms: true, // 카카오 발송 실패 시 SMS 폴백 차단
      },
    };

    if (buttons && buttons.length > 0) {
      (messageParams.kakaoOptions as Record<string, unknown>).buttons = buttons;
    }

    const result = await client.sendOne(messageParams as Parameters<typeof client.sendOne>[0]);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    const message = extractSolapiError(err);
    console.error("[Solapi Alimtalk] 발송 실패:", message, err);
    return { success: false, error: message };
  }
}

// ─── 브랜드 메시지 (구 친구톡) 발송 ───

export async function sendBrandMessageViaSolapi(
  phone: string,
  message: string,
  options?: {
    imageUrl?: string;
    buttons?: Array<{ buttonName: string; buttonType: string; linkMo?: string; linkPc?: string }>;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getSolapiClient();
  if (!client) {
    console.log("[Solapi BrandMessage] SDK 미설정 — 발송 스킵:", { phone, message });
    return { success: false, error: "Solapi not configured" };
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const pfId = PFID();
  const senderNumber = process.env.SOLAPI_SENDER_NUMBER;

  if (!pfId) {
    return { success: false, error: "SOLAPI_PFID 환경변수 미설정" };
  }
  if (!senderNumber) {
    return {
      success: false,
      error:
        "SOLAPI_SENDER_NUMBER 미설정 — 솔라피에 사전 등록된 발신번호가 필요합니다.",
    };
  }

  try {
    // 친구톡: 텍스트(CTA) / 이미지 포함(CTI) 분기
    const hasImage = !!options?.imageUrl;
    const messageType = hasImage ? "CTI" : "CTA";

    const kakaoOptions: Record<string, unknown> = {
      pfId,
      disableSms: true, // 카카오 발송 실패 시 SMS 폴백 차단
    };

    if (options?.buttons && options.buttons.length > 0) {
      kakaoOptions.buttons = options.buttons;
    }

    // 이미지가 있는 경우 솔라피 Storage API로 업로드해 imageId 획득
    if (hasImage) {
      try {
        const clickLink =
          options?.buttons?.[0]?.linkMo ||
          options?.buttons?.[0]?.linkPc ||
          options!.imageUrl!;
        const uploadResult = await (
          client as unknown as {
            uploadFile: (
              filePath: string,
              fileType: string,
              name?: string,
              link?: string
            ) => Promise<{ fileId: string }>;
          }
        ).uploadFile(options!.imageUrl!, "KAKAO", undefined, clickLink);
        if (!uploadResult?.fileId) {
          return {
            success: false,
            error: "이미지 업로드 실패 — Solapi Storage API 응답 없음",
          };
        }
        kakaoOptions.imageId = uploadResult.fileId;
      } catch (uploadErr) {
        const uploadMsg = extractSolapiError(uploadErr);
        console.error("[Solapi BrandMessage] 이미지 업로드 실패:", uploadMsg, uploadErr);
        return { success: false, error: `이미지 업로드 실패: ${uploadMsg}` };
      }
    }

    const result = await client.sendOne({
      to: normalizedPhone,
      from: normalizePhoneNumber(senderNumber),
      text: message, // 본문은 메시지 최상위 — kakaoOptions에는 text 필드 없음
      type: messageType,
      kakaoOptions,
    } as Parameters<typeof client.sendOne>[0]);

    return { success: true, messageId: result.messageId };
  } catch (err) {
    const message2 = extractSolapiError(err);
    console.error("[Solapi BrandMessage] 발송 실패:", message2, err);
    return { success: false, error: message2 };
  }
}

// ─── 솔라피 템플릿 목록 조회 ───

export async function getApprovedTemplatesFromSolapi(): Promise<
  Array<{
    templateId: string;
    name: string;
    content: string;
    status: string;
    buttons?: unknown[];
  }>
> {
  const client = getSolapiClient();
  if (!client) return [];

  try {
    // 솔라피 SDK의 카카오 알림톡 템플릿 목록 조회
    const result = await (client as unknown as { getAlimtalkTemplates: () => Promise<{ templateList: Array<{ templateId: string; templateName: string; templateContent: string; templateStatus: string; buttons?: unknown[] }> }> }).getAlimtalkTemplates();
    return (result.templateList || []).map((t) => ({
      templateId: t.templateId,
      name: t.templateName,
      content: t.templateContent,
      status: t.templateStatus,
      buttons: t.buttons,
    }));
  } catch (err) {
    console.error("[Solapi] 템플릿 조회 실패:", err);
    return [];
  }
}

// ─── 기존 강의 알림 호환 함수 (솔라피 경유) ───

export async function sendLectureSelectedNotification(
  phone: string,
  lectureName: string
): Promise<void> {
  await sendAlimtalkViaSolapi(phone, "LECTURE_SELECTED", { "강의명": lectureName });
}

export async function sendLectureRejectedNotification(
  phone: string,
  lectureName: string
): Promise<void> {
  await sendAlimtalkViaSolapi(phone, "LECTURE_REJECTED", { "강의명": lectureName });
}
