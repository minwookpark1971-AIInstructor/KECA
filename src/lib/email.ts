import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
    return null;
  }
  return new Resend(key);
}

const FROM_EMAIL = "KECA 한국교육컨설팅협회 <noreply@keca.or.kr>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@keca.or.kr";

// 문의 접수 알림 (관리자에게)
export async function sendInquiryNotification(inquiry: {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  message: string;
}) {
  try {
    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[KECA 교육문의] ${inquiry.company_name}`,
      html: `
        <h2>새로운 교육문의가 접수되었습니다</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">기관명</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.company_name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">담당자</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.contact_name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">이메일</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.contact_email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">연락처</td><td style="padding:8px;border:1px solid #ddd;">${inquiry.contact_phone}</td></tr>
        </table>
        <h3 style="margin-top:16px;">문의 내용</h3>
        <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px;">${inquiry.message}</p>
        <p style="margin-top:16px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/inquiries">관리자 페이지에서 확인하기</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send inquiry notification:", error);
  }
}

// 문의 접수 확인 (문의자에게)
export async function sendInquiryConfirmation(to: string, companyName: string) {
  try {
    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "[KECA] 교육문의가 접수되었습니다",
      html: `
        <h2>${companyName}님, 교육문의가 정상적으로 접수되었습니다.</h2>
        <p>담당자가 확인 후 빠른 시일 내에 연락드리겠습니다.</p>
        <p>문의 사항이 있으시면 <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>로 연락해 주세요.</p>
        <br/>
        <p style="color:#888;font-size:12px;">한국교육컨설팅협회 KECA</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send inquiry confirmation:", error);
  }
}

// 회원 승인 알림
export async function sendApprovalNotification(to: string, name: string) {
  try {
    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "[KECA] 회원 가입이 승인되었습니다",
      html: `
        <h2>${name}님, 환영합니다!</h2>
        <p>KECA(한국교육컨설팅협회) 회원 가입이 승인되었습니다.</p>
        <p>정회원 혜택을 이용하시려면 협회비 납부가 필요합니다.</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/mypage/membership" style="display:inline-block;background:#2563eb;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">협회비 납부하기</a>
        <br/><br/>
        <p style="color:#888;font-size:12px;">한국교육컨설팅협회 KECA</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send approval notification:", error);
  }
}

// 마케팅 이메일 발송
export async function sendMarketingEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeUrl: string
) {
  const resend = getResend();
  if (!resend) return { success: false, error: "Resend not configured" };

  const footer = `
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee;text-align:center;">
      <p style="color:#888;font-size:12px;">한국교육컨설팅협회 KECA | kecamanager@gmail.com</p>
      <p style="color:#aaa;font-size:11px;margin-top:4px;">
        <a href="${unsubscribeUrl}" style="color:#aaa;">수신 거부</a>
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: "kecamanager@gmail.com",
    subject,
    html: html + footer,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, id: data?.id };
}

// 결제 완료 알림
export async function sendPaymentConfirmation(
  to: string,
  name: string,
  amount: number,
  expiresAt: string,
  paymentType: string = "annual_membership"
) {
  try {
    const resend = getResend();
    if (!resend) return;

    const isDeposit = paymentType === "deposit";
    const subject = isDeposit
      ? "[KECA] 보증금 결제가 완료되었습니다"
      : "[KECA] 협회비 결제가 완료되었습니다";

    const bodyRows = isDeposit
      ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">결제 금액</td><td style="padding:8px;border:1px solid #ddd;">${amount.toLocaleString()}원</td></tr>
         <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">결제 유형</td><td style="padding:8px;border:1px solid #ddd;">강사 보증금</td></tr>`
      : `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">결제 금액</td><td style="padding:8px;border:1px solid #ddd;">${amount.toLocaleString()}원</td></tr>
         <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">유효 기간</td><td style="padding:8px;border:1px solid #ddd;">${expiresAt}까지</td></tr>
         <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">회원 등급</td><td style="padding:8px;border:1px solid #ddd;">정회원</td></tr>`;

    const heading = isDeposit
      ? `${name}님, 보증금 결제가 완료되었습니다.`
      : `${name}님, 협회비 결제가 완료되었습니다.`;

    const ctaUrl = isDeposit
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/mypage/applications`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/mypage`;
    const ctaLabel = isDeposit ? "지원이력 바로가기" : "마이페이지 바로가기";

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <h2>${heading}</h2>
        <table style="border-collapse:collapse;width:100%;max-width:400px;">
          ${bodyRows}
        </table>
        <br/>
        <a href="${ctaUrl}" style="display:inline-block;background:#2563eb;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">${ctaLabel}</a>
        <br/><br/>
        <p style="color:#888;font-size:12px;">한국교육컨설팅협회 KECA</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment confirmation:", error);
  }
}
