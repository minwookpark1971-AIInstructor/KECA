import { getLectures } from "@/lib/supabase/queries";
import Link from "next/link";
import LecturesAdminClient from "./LecturesAdminClient";

export const metadata = { title: "강의공고 관리" };

export default async function AdminLecturesPage() {
  const lectures = await getLectures();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">강의공고 관리</h1>
          <p className="text-sm text-text-sub mt-1">총 {lectures.length}건</p>
        </div>
        <Link
          href="/admin/lectures/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + 공고 등록
        </Link>
      </div>

      <LecturesAdminClient lectures={lectures} />
    </div>
  );
}
