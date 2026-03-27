import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";

export const metadata: Metadata = { title: "검정기준 및 과목" };

export default function StandardsPage() {
  return (
    <>
      <SubpageHero title="검정기준 및 과목" breadcrumb={[{ label: "자격소개", href: "/certification" }, { label: "검정기준 및 과목" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <p className="text-text-sub mb-6">상세 검정 기준은 <a href="/certification" className="text-primary underline">자격소개</a> 페이지를 참고해주세요.</p>
        </div>
      </section>
    </>
  );
}
