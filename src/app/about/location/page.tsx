import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { MapPin, Mail, Clock } from "lucide-react";

export const metadata: Metadata = { title: "오시는길" };

export default function LocationPage() {
  return (
    <>
      <SubpageHero
        title="오시는길"
        subtitle="한국교육컨설팅협회 찾아오시는 방법"
        breadcrumb={[{ label: "협회소개", href: "/about" }, { label: "오시는길" }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="flex items-start gap-3 bg-surface rounded-xl p-5">
              <MapPin size={20} className="text-accent mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-text mb-1">주소</h4>
                <p className="text-sm text-text-sub">서울특별시 도봉구 마들로13길84</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-surface rounded-xl p-5">
              <Mail size={20} className="text-accent mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-text mb-1">이메일</h4>
                <p className="text-sm text-text-sub">info@keca.or.kr</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-surface rounded-xl p-5">
              <Clock size={20} className="text-accent mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-text mb-1">운영시간</h4>
                <p className="text-sm text-text-sub">평일 09:00 ~ 18:00</p>
              </div>
            </div>
          </div>

          {/* 지도 placeholder */}
          <div className="bg-surface border border-border-light rounded-xl h-80 flex items-center justify-center">
            <p className="text-text-muted text-sm">지도가 표시될 영역입니다</p>
          </div>
        </div>
      </section>
    </>
  );
}
