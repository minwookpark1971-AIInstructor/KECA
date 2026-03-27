import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { mockVideoPosts } from "@/lib/mock-community";
import { Play, Eye } from "lucide-react";

export const metadata: Metadata = { title: "영상갤러리" };

export default function VideosPage() {
  return (
    <>
      <SubpageHero title="영상갤러리" breadcrumb={[{ label: "커뮤니티" }, { label: "영상갤러리" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVideoPosts.map((post) => (
              <div key={post.id} className="rounded-xl border border-border-light overflow-hidden bg-white card-hover">
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Play size={24} className="text-white ml-1" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-text">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span>{post.created_at}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{post.view_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
