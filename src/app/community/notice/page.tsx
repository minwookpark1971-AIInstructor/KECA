import { Metadata } from "next";
import { SubpageHero } from "@/components/layout/SubpageHero";
import { getPostsByBoard } from "@/lib/supabase/queries";
import NoticeContent from "./NoticeContent";

export const metadata: Metadata = { title: "공지사항" };

export default async function NoticePage() {
  const posts = await getPostsByBoard("notice");
  return (
    <>
      <SubpageHero title="공지사항" breadcrumb={[{ label: "커뮤니티" }, { label: "공지사항" }]} />
      <section className="py-16 lg:py-20">
        <div className="container-custom max-w-4xl">
          <NoticeContent posts={posts} />
        </div>
      </section>
    </>
  );
}
