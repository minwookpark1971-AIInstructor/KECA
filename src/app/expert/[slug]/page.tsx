import { SubpageHero } from "@/components/layout/SubpageHero";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ExpertDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <SubpageHero
        title={title}
        breadcrumb={[{ label: "전문가과정", href: "/expert" }, { label: title }]}
      />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-3xl text-center">
          <p className="text-text-sub mb-6">이 과정의 상세 내용은 준비 중입니다.</p>
          <Link href="/inquiry" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white hover:bg-gray-50 text-primary border border-border rounded-full transition-colors shadow-sm">
            교육문의 <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
