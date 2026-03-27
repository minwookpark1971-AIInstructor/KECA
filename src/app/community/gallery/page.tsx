import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { mockGalleryPosts } from "@/lib/mock-community";
import { Image as ImageIcon, Eye } from "lucide-react";

export const metadata: Metadata = { title: "교육사진 갤러리" };

export default function GalleryPage() {
  return (
    <>
      <SubpageHero title="교육사진 갤러리" breadcrumb={[{ label: "커뮤니티" }, { label: "교육사진 갤러리" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockGalleryPosts.map((post) => (
              <Link
                key={post.id}
                href={`/community/photo_gallery/${post.id}`}
                className="group rounded-xl border border-border-light overflow-hidden card-hover bg-white"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-surface to-surface-dark flex items-center justify-center">
                  <ImageIcon size={48} className="text-text-muted/30" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors">{post.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span>{post.created_at}</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{post.view_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
