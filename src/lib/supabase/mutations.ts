"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import {
  sendInquiryNotification,
  sendInquiryConfirmation,
  sendApprovalNotification,
} from "@/lib/email";

// ─── 회원 관리 ───

export async function approveMember(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "approved", approved_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // 승인 알림 이메일 발송
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, name")
    .eq("id", userId)
    .single();
  if (profile) {
    sendApprovalNotification(profile.email, profile.name);
  }

  revalidatePath("/admin/members");
}

export async function changeUserRole(userId: string, role: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
}

// ─── 프로그램 ───

export async function createProgram(formData: {
  title: string;
  slug: string;
  category_id?: string;
  program_type: string;
  target_audience?: string;
  duration?: string;
  description?: string;
  thumbnail_url?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .insert({
      ...formData,
      status: formData.status || "draft",
      is_featured: false,
      sort_order: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/programs");
  return data;
}

export async function updateProgram(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("programs")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/programs");
  revalidatePath(`/programs`);
}

export async function deleteProgram(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/programs");
}

// ─── 커뮤니티 게시판 ───

export async function createPost(formData: {
  board_type: string;
  title: string;
  content?: string;
  status?: string;
  is_pinned?: boolean;
  author_id?: string;
  video_url?: string;
  file_url?: string;
  thumbnail_url?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...formData,
      status: formData.status || "published",
      view_count: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/community/${formData.board_type}`);
  revalidatePath(`/community`);
  return data;
}

export async function updatePost(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/community");
  revalidatePath("/community");
}

export async function deletePost(id: string, boardType: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/community/${boardType}`);
  revalidatePath("/community");
}

// ─── 교육문의 ───

export async function updateInquiryStatus(id: string, status: string) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.responded_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from("inquiries")
    .update(updates)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}

export async function createInquiry(formData: {
  inquiry_type: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  preferred_category_id?: string;
  estimated_participants?: string;
  preferred_date?: string;
  budget_range?: string;
  message: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .insert({ ...formData, status: "new" });
  if (error) throw new Error(error.message);

  // 이메일 알림 발송 (관리자 + 문의자)
  sendInquiryNotification(formData);
  sendInquiryConfirmation(formData.contact_email, formData.company_name);
}

// ─── 교육일정 ───

export async function createSchedule(formData: {
  title: string;
  description?: string;
  program_id?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_online: boolean;
  status?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedules")
    .insert({ ...formData, status: formData.status || "scheduled" });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/schedules");
  revalidatePath("/community/schedule");
}

export async function updateSchedule(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedules")
    .update(fields)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/schedules");
  revalidatePath("/community/schedule");
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/schedules");
}

// ─── 파트너 ───

export async function createPartner(formData: {
  name: string;
  website_url?: string;
  logo_url?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("partners")
    .insert({ ...formData, is_active: true, sort_order: 99 });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partners");
}

export async function updatePartner(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("partners")
    .update(fields)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partners");
}

export async function deletePartner(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partners");
}

// ─── 강사 등록 (Admin) ───

export async function createInstructor(formData: {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  career_summary?: string;
  specialties?: string[];
  video_url?: string;
  profile_image_url?: string;
  profile_card_url?: string;
  is_profile_public?: boolean;
}) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();

  // admin API로 사용자 생성 (임시 비밀번호)
  const tempPassword = `KECA_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: formData.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: formData.name, phone: formData.phone || "" },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("사용자 생성 실패");

  // profiles 테이블 업데이트 (trigger가 기본 row를 생성했을 수 있음)
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: authData.user.id,
      email: formData.email,
      name: formData.name,
      phone: formData.phone || null,
      role: "instructor",
      bio: formData.bio || null,
      career_summary: formData.career_summary || null,
      specialties: formData.specialties || [],
      video_url: formData.video_url || null,
      profile_image_url: formData.profile_image_url || null,
      profile_card_url: formData.profile_card_url || null,
      is_profile_public: formData.is_profile_public ?? true,
      approved_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (profileError) throw new Error(profileError.message);
  revalidatePath("/admin/instructors");
  revalidatePath("/instructors");
  return authData.user.id;
}

export async function updateInstructor(
  userId: string,
  fields: {
    name?: string;
    phone?: string;
    bio?: string;
    career_summary?: string;
    specialties?: string[];
    video_url?: string | null;
    profile_image_url?: string | null;
    profile_card_url?: string | null;
    is_profile_public?: boolean;
  }
) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/instructors");
  revalidatePath("/instructors");
}

export async function deleteInstructor(userId: string) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  // profiles 삭제 (cascade로 auth.users도 삭제)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error(authError.message);
  revalidatePath("/admin/instructors");
  revalidatePath("/instructors");
}

// ─── 카테고리 ───

export async function createCategory(formData: {
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  sort_order?: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ ...formData, is_active: true, sort_order: formData.sort_order ?? 99 });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/programs");
}

export async function updateCategory(id: string, fields: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/programs");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/programs");
}

// ─── 사이트 설정 ───

export async function saveSiteSettings(
  settings: { key: string; value: unknown }[]
) {
  const supabase = await createClient();
  for (const s of settings) {
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: s.key, value: s.value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/settings");
}
