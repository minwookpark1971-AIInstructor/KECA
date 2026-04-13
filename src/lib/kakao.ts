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
    console.warn("[Solapi] API 키 미설정 — 발송을 스킵합니다.");
    return null;
  }

  return new SolapiMessageService(apiKey, apiSecret);
}

const PFID = () => process.env.SOLAPI_PFID || "";

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

  if (!pfId) {
    return { success: false, error: "SOLAPI_PFID not configured" };
  }

  try {
    const messageParams: Record<string, unknown> = {
      to: normalizedPhone,
      from: process.env.SOLAPI_SENDER_NUMBER || normalizedPhone,
      kakaoOptions: {
        pfId,
        templateId,
        variables,
      },
    };

    if (buttons && buttons.length > 0) {
      (messageParams.kakaoOptions as Record<string, unknown>).buttons = buttons;
    }

    const result = await client.sendOne(messageParams as Parameters<typeof client.sendOne>[0]);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "알림톡 발송 실패";
    console.error("[Solapi Alimtalk] 발송 실패:", message);
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

  if (!pfId) {
    return { success: false, error: "SOLAPI_PFID not configured" };
  }

  try {
    const kakaoOptions: Record<string, unknown> = {
      pfId,
      text: message,
    };

    if (options?.imageUrl) {
      kakaoOptions.imageUrl = options.imageUrl;
    }
    if (options?.buttons && options.buttons.length > 0) {
      kakaoOptions.buttons = options.buttons;
    }

    const result = await client.sendOne({
      to: normalizedPhone,
      from: process.env.SOLAPI_SENDER_NUMBER || normalizedPhone,
      kakaoOptions,
    } as Parameters<typeof client.sendOne>[0]);

    return { success: true, messageId: result.messageId };
  } catch (err) {
    const message2 = err instanceof Error ? err.message : "브랜드 메시지 발송 실패";
    console.error("[Solapi BrandMessage] 발송 실패:", message2);
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
