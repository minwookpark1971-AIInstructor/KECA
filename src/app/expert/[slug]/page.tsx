import { notFound, redirect } from "next/navigation";
import { getProgramBySlug } from "@/lib/supabase/queries";

export default async function ExpertDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (program) {
    redirect(`/programs/${slug}`);
  }

  notFound();
}
