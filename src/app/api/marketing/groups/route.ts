import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: all groups
export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("marketing_groups")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json({ groups: data || [] });
}

// POST: add members to group
export async function POST(request: NextRequest) {
  const { groupId, memberIds } = await request.json();
  if (!groupId || !memberIds?.length) {
    return NextResponse.json({ error: "Missing groupId or memberIds" }, { status: 400 });
  }

  const supabase = createAdminClient();
  // Get current member_ids
  const { data: group } = await supabase
    .from("marketing_groups")
    .select("member_ids")
    .eq("id", groupId)
    .single();

  const existing = (group?.member_ids as string[]) || [];
  const merged = [...new Set([...existing, ...memberIds])];

  const { error } = await supabase
    .from("marketing_groups")
    .update({
      member_ids: merged,
      member_count: merged.length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, memberCount: merged.length });
}
