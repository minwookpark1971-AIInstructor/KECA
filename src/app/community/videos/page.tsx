import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPostsByBoard } from "@/lib/supabase/queries";
import { Play, Eye } from "lucide-react";

export const metadata: Metadata = { title: "영상갤러리" };

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export default async function VideosPage() {
  const videoPosts = await getPostsByBoard("video_gallery");
  return (
    <>
      <SubpageHero title="영상갤러리" breadcrumb={[{ label: "커뮤니티" }, { label: "영상갤러리" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoPosts.map((post) => {
              const ytId = post.video_url ? getYouTubeId(post.video_url) : null;
              return (
                <Link key={post.id} href={`/community/video_gallery/${post.id}`} className="group rounded-xl border border-border-light overflow-hidden bg-white card-hover">
                  <div className="aspect-video bg-gray-900 flex items-center justify-center relative overflow-hidden">
                    {ytId ? (
                      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span>{post.created_at?.slice(0, 10)}</span>
                      <span className="flex items-center gap-1"><Eye size={12} />{post.view_count}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
