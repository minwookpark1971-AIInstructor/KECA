import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPostsByBoard } from "@/lib/supabase/queries";
import { FileText, Download, Eye, Lock } from "lucide-react";

export const metadata: Metadata = { title: "자료실" };

export default async function ResourcesPage() {
  const resources = await getPostsByBoard("resource");
  return (
    <>
      <SubpageHero title="자료실" subtitle="정회원 전용 교육 자료를 다운로드하실 수 있습니다" breadcrumb={[{ label: "커뮤니티" }, { label: "자료실" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          {/* 로그인 안내 */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Lock size={18} className="text-accent shrink-0" />
            <p className="text-sm text-text-sub">자료 다운로드는 정회원 로그인 후 이용 가능합니다.</p>
          </div>

          <div className="space-y-3">
            {resources.map((res, i) => (
              <div key={res.id} className="flex items-center gap-4 bg-white border border-border-light rounded-xl p-4 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text">{res.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{res.created_at}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{res.view_count}</span>
                  </div>
                </div>
                {res.file_url ? (
                  <a href={res.file_url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 text-primary hover:text-primary-light transition-colors" title="다운로드">
                    <Download size={18} />
                  </a>
                ) : (
                  <span className="shrink-0 p-2 text-text-muted" title="파일 없음">
                    <Download size={18} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
