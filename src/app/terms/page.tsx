import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "이용약관" };

<<<<<<< HEAD
const sections = [
  {
    title: "제1조 (목적)",
    content:
      "이 약관은 사단법인 한국교육컨설팅협회(이하 \"협회\")가 제공하는 웹사이트 및 관련 서비스(이하 \"서비스\")의 이용 조건 및 절차, 회원과 협회의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
  },
  {
    title: "제2조 (용어의 정의)",
    content:
      "① \"회원\"이란 협회에 개인정보를 제공하여 회원등록을 한 자로서, 협회의 서비스를 이용할 수 있는 자를 말합니다.\n② \"서비스\"란 협회가 제공하는 교육프로그램 안내, 교육문의, 자격과정, 커뮤니티 등 일체의 온라인 서비스를 말합니다.\n③ \"관리자\"란 서비스의 전반적인 관리와 원활한 운영을 위해 협회가 선정한 자를 말합니다.",
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    content:
      "① 이 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다.\n② 협회는 필요한 경우 관련 법령에 위배되지 않는 범위 내에서 이 약관을 변경할 수 있으며, 변경된 약관은 적용일자 및 변경사유를 명시하여 공지합니다.",
  },
  {
    title: "제4조 (서비스의 제공 및 변경)",
    content:
      "① 협회는 회원에게 교육프로그램 정보 제공, 교육문의 접수, 자격과정 안내, 회원 관리 등의 서비스를 제공합니다.\n② 협회는 서비스의 내용을 변경하는 경우 그 사유와 적용일자를 명시하여 사전에 공지합니다.",
  },
  {
    title: "제5조 (회원의 의무)",
    content:
      "① 회원은 관련 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.\n② 회원은 협회의 사전 승낙 없이 서비스를 이용하여 영업 활동을 할 수 없습니다.\n③ 회원은 서비스 이용과 관련하여 타인의 권리를 침해하거나 불법적인 행위를 해서는 안 됩니다.",
  },
  {
    title: "제6조 (면책 및 손해배상)",
    content:
      "① 협회는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 대한 책임이 면제됩니다.\n② 협회는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.\n③ 이 약관에서 정하지 않은 사항은 관련 법령에 따릅니다.",
  },
];

export default function TermsPage() {
  return (
    <>
      <SubpageHero
        title="이용약관"
        breadcrumb={[{ label: "이용약관" }]}
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
=======
export default function TermsPage() {
  return (
    <>
      <SubpageHero title="이용약관" breadcrumb={[{ label: "이용약관" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl">
          <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-10 prose prose-sm max-w-none text-text-sub">
            <h2 className="text-lg font-bold text-text">제1조 (목적)</h2>
            <p>
              본 약관은 한국교육컨설팅협회(이하 &quot;협회&quot;)가 운영하는 KECA 웹사이트(이하 &quot;사이트&quot;)에서 제공하는
              서비스의 이용 조건 및 절차, 회원과 협회의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.
            </p>

            <h2 className="text-lg font-bold text-text mt-8">제2조 (용어의 정의)</h2>
            <p>
              1. &quot;회원&quot;이란 본 약관에 동의하고 협회에 가입하여 서비스를 이용하는 자를 말합니다.<br />
              2. &quot;서비스&quot;란 협회가 사이트를 통해 제공하는 교육프로그램 정보, 자격증 과정, 커뮤니티 등 모든 서비스를 말합니다.
            </p>

            <h2 className="text-lg font-bold text-text mt-8">제3조 (회원가입)</h2>
            <p>
              1. 회원가입은 이용자가 본 약관에 동의한 후 가입신청을 하고, 협회가 이를 승인함으로써 체결됩니다.<br />
              2. 협회는 가입신청자의 신청에 대하여 승인을 원칙으로 하나, 부적절한 목적의 가입 등은 거절할 수 있습니다.
            </p>

            <h2 className="text-lg font-bold text-text mt-8">제4조 (서비스의 제공)</h2>
            <p>
              협회는 다음과 같은 서비스를 제공합니다.<br />
              1. 교육프로그램 정보 제공<br />
              2. 자격증 과정 및 검정 안내<br />
              3. 교육 일정 및 공지사항 제공<br />
              4. 커뮤니티 서비스 (교육후기, 갤러리, 자료실)<br />
              5. 기타 협회가 정하는 서비스
            </p>

            <h2 className="text-lg font-bold text-text mt-8">제5조 (회원의 의무)</h2>
            <p>
              1. 회원은 가입 시 정확한 정보를 제공하여야 합니다.<br />
              2. 회원은 타인의 개인정보를 도용하여서는 안 됩니다.<br />
              3. 회원은 협회가 제공하는 서비스를 본래의 목적 이외의 용도로 사용하여서는 안 됩니다.
            </p>

            <h2 className="text-lg font-bold text-text mt-8">제6조 (협회비)</h2>
            <p>
              1. 정회원 자격 유지를 위해 연간 협회비를 납부하여야 합니다.<br />
              2. 협회비는 협회가 정한 금액에 따르며, 변경 시 사전 공지합니다.<br />
              3. 납부된 협회비는 원칙적으로 환불되지 않습니다.
            </p>

            <p className="text-xs text-text-muted mt-10">시행일: 2026년 1월 1일</p>
>>>>>>> 263dd1c7d81a75adc07a4c816af1a692986eac76
          </div>
        </div>
      </section>
    </>
  );
}
