import { Metadata } from "next";
import Link from "next/link";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPostsByBoard } from "@/lib/supabase/queries";
import { Star, Eye } from "lucide-react";

export const metadata: Metadata = { title: "교육후기" };

export default async function ReviewPage() {
  const reviews = await getPostsByBoard("review");
  return (
    <>
      <SubpageHero title="교육후기" breadcrumb={[{ label: "커뮤니티" }, { label: "교육후기" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/community/review/${review.id}`}
                className="block bg-white border border-border-light rounded-xl p-6 card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text mb-2 group-hover:text-primary">{review.title}</h3>
                    <p className="text-sm text-text-sub line-clamp-2">{review.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                      <span>{review.created_at}</span>
                      <span className="flex items-center gap-1"><Eye size={12} />{review.view_count}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
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
