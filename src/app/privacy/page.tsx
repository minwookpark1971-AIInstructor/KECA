import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "개인정보처리방침" };

const sections = [
  {
    title: "1. 개인정보의 수집 및 이용 목적",
    content:
      "협회는 다음의 목적을 위하여 개인정보를 처리합니다.\n• 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 회원자격 유지·관리\n• 교육 서비스 제공: 교육프로그램 신청·수강, 자격과정 운영, 교육문의 처리\n• 결제 및 정산: 연회비 및 자격시험 응시료 결제 처리\n• 고충 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보",
  },
  {
    title: "2. 수집하는 개인정보 항목",
    content:
      "• 필수 항목: 이름, 이메일, 연락처, 비밀번호\n• 선택 항목: 소속 기관, 직위, 전문분야\n• 자동 수집: 접속 IP 주소, 접속 일시, 서비스 이용 기록",
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    content:
      "회원의 개인정보는 회원 탈퇴 시까지 보유·이용됩니다. 다만, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보존합니다.\n• 계약 또는 청약 철회 등에 관한 기록: 5년\n• 대금결제 및 재화 등의 공급에 관한 기록: 5년\n• 소비자의 불만 또는 분쟁 처리에 관한 기록: 3년",
  },
  {
    title: "4. 개인정보의 제3자 제공",
    content:
      "협회는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.\n• 회원이 사전에 동의한 경우\n• 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우",
  },
  {
    title: "5. 개인정보의 파기 절차 및 방법",
    content:
      "협회는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.\n• 전자적 파일: 복구 및 재생이 되지 않도록 기술적 방법을 이용하여 안전하게 삭제\n• 종이 문서: 분쇄기로 분쇄하거나 소각하여 파기",
  },
  {
    title: "6. 정보주체의 권리·의무",
    content:
      "회원은 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제, 처리정지를 요청할 수 있습니다.\n• 마이페이지를 통한 직접 수정\n• 이메일(info@keca.or.kr) 또는 전화를 통한 요청\n• 개인정보 처리정지 요청 시 서비스 이용이 제한될 수 있습니다.",
  },
  {
    title: "7. 개인정보 보호책임자",
    content:
      "협회는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 회원의 개인정보 관련 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n• 개인정보 보호책임자: 사무국장\n• 연락처: info@keca.or.kr\n• 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우 개인정보침해신고센터(118), 대검찰청 사이버수사과(1301), 경찰청 사이버안전국(182)으로 문의하시기 바랍니다.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SubpageHero
        title="개인정보처리방침"
        breadcrumb={[{ label: "개인정보처리방침" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          <div className="space-y-10">
            {sections.map((s, i) => (
              <article key={i}>
                <h2 className="text-lg font-bold text-text mb-3">{s.title}</h2>
                <p className="text-sm text-text-sub leading-relaxed whitespace-pre-line">
                  {s.content}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-border-light text-xs text-text-muted">
            시행일: 2026년 1월 1일
          </div>
        </div>
      </section>
    </>
  );
}
