import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <>
      <SubpageHero title="개인정보처리방침" breadcrumb={[{ label: "개인정보처리방침" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-10 prose prose-sm max-w-none text-text-sub">
            <h2 className="text-lg font-bold text-text">1. 개인정보의 수집 및 이용 목적</h2>
            <p>
              협회는 다음의 목적을 위하여 개인정보를 처리합니다.<br />
              1. 회원 가입 및 관리: 회원 식별, 가입의사 확인, 서비스 제공<br />
              2. 교육 서비스 제공: 교육프로그램 신청 및 운영, 자격증 발급<br />
              3. 결제 처리: 협회비 결제, 영수증 발급<br />
              4. 문의 응대: 교육문의 접수 및 답변
            </p>

            <h2 className="text-lg font-bold text-text mt-8">2. 수집하는 개인정보 항목</h2>
            <p>
              <strong>필수 항목:</strong> 이름, 이메일, 비밀번호<br />
              <strong>선택 항목:</strong> 연락처, 소속기관<br />
              <strong>강사 추가 항목:</strong> 프로필 사진, 경력사항, 전문분야<br />
              <strong>결제 시:</strong> 결제 정보(토스페이먼츠를 통해 처리, 협회 서버에 카드번호 미저장)
            </p>

            <h2 className="text-lg font-bold text-text mt-8">3. 개인정보의 보유 및 이용 기간</h2>
            <p>
              회원 탈퇴 시까지 보유하며, 관계법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.<br />
              - 계약 또는 청약철회 등에 관한 기록: 5년<br />
              - 대금결제 및 재화 등의 공급에 관한 기록: 5년<br />
              - 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
            </p>

            <h2 className="text-lg font-bold text-text mt-8">4. 개인정보의 제3자 제공</h2>
            <p>
              협회는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다.
              다만, 법령에 의해 요구되는 경우 또는 회원의 사전 동의가 있는 경우에는 예외로 합니다.
            </p>

            <h2 className="text-lg font-bold text-text mt-8">5. 개인정보의 처리 위탁</h2>
            <p>
              협회는 서비스 운영을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.<br />
              - 결제 처리: 토스페이먼츠 (주)<br />
              - 이메일 발송: Resend Inc.<br />
              - 데이터 저장: Supabase Inc.
            </p>

            <h2 className="text-lg font-bold text-text mt-8">6. 회원의 권리</h2>
            <p>
              1. 회원은 언제든지 자신의 개인정보를 열람, 수정, 삭제할 수 있습니다.<br />
              2. 회원은 개인정보 처리에 대한 동의를 철회할 수 있습니다.<br />
              3. 개인정보 관련 문의는 아래 연락처로 문의해 주시기 바랍니다.
            </p>

            <h2 className="text-lg font-bold text-text mt-8">7. 개인정보 보호책임자</h2>
            <p>
              성명: KECA 관리자<br />
              이메일: info@keca.or.kr
            </p>

            <p className="text-xs text-text-muted mt-10">시행일: 2026년 1월 1일</p>
          </div>
        </div>
      </section>
    </>
  );
}
