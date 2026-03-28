import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrograms, getCategories } from "@/lib/supabase/queries";
import { ArrowLeft, Edit2 } from "lucide-react";

export default async function AdminProgramEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [programs, categories] = await Promise.all([getPrograms(), getCategories()]);
  const program = programs.find((p) => p.id === id);
  if (!program) notFound();

  const category = categories.find((c) => c.id === (program.category_id || ""));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/programs" className="p-2 text-text-muted hover:text-primary rounded-lg hover:bg-surface transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text">{program.title}</h1>
          <p className="text-sm text-text-sub">{category?.name} · {program.status === "published" ? "공개" : "초안"}</p>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-xl p-6">
        <p className="text-sm text-text-muted text-center py-8">
          프로그램 수정 에디터는 Supabase 연동 후 활성화됩니다.
          <br />
          현재 프로그램 상세는 <Link href={`/programs/${program.slug}`} className="text-primary hover:underline">공개 페이지</Link>에서 확인 가능합니다.
        </p>
      </div>
    </div>
  );
}
