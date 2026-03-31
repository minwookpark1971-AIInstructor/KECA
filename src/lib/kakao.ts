/**
 * 카카오 비즈 메시지 API (알림톡)
 *
 * 사전 조건:
 * - 카카오 비즈니스 채널 개설 + 알림톡 채널 연동
 * - 알림톡 템플릿 승인 (LECTURE_SELECTED, LECTURE_REJECTED)
 * - 환경변수: KAKAO_BIZ_API_KEY, KAKAO_BIZ_SENDER_ID
 *
 * API: https://developers.kakao.com/docs/latest/ko/kakaotalk-channel/rest-api
 */

const KAKAO_BIZ_URL = "https://api-alimtalk.kakao.com/alimtalk/v2.0/senders";

export async function sendKakaoAlimtalk(
  phone: string,
  templateCode: string,
  variables: Record<string, string>
): Promise<void> {
  const apiKey = process.env.KAKAO_BIZ_API_KEY;
  const senderId = process.env.KAKAO_BIZ_SENDER_ID;

  if (!apiKey || !senderId) {
    // API 키 미설정 시 로그만 출력 (개발 환경)
    console.log("[Kakao Alimtalk] API 키 미설정 - 발송 스킵:", {
      phone,
      templateCode,
      variables,
    });
    return;
  }

  // 전화번호 정규화 (010-1234-5678 → 01012345678)
  const normalizedPhone = phone.replace(/[^0-9]/g, "");

  const body = {
    senderKey: senderId,
    templateCode,
    recipientList: [
      {
        recipientNo: normalizedPhone,
        templateParameter: variables,
      },
    ],
  };

  try {
    const res = await fetch(`${KAKAO_BIZ_URL}/${senderId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `KakaoAK ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Kakao Alimtalk] 발송 실패:", text);
    }
  } catch (err) {
    // 알림 실패해도 본 흐름 중단하지 않음
    console.error("[Kakao Alimtalk] 오류:", err);
  }
}

/**
 * 선발 알림
 * 템플릿: "강의공고 #{강의명}에 선발되셨습니다. 담당자가 곧 연락드리겠습니다."
 */
export async function sendLectureSelectedNotification(
  phone: string,
  lectureName: string
): Promise<void> {
  return sendKakaoAlimtalk(phone, "LECTURE_SELECTED", { 강의명: lectureName });
}

/**
 * 미선발 알림
 * 템플릿: "강의공고 #{강의명} 지원 결과, 이번에는 함께하지 못하게 되었습니다. 보증금은 3영업일 이내 환불됩니다."
 */
export async function sendLectureRejectedNotification(
  phone: string,
  lectureName: string
): Promise<void> {
  return sendKakaoAlimtalk(phone, "LECTURE_REJECTED", { 강의명: lectureName });
}
