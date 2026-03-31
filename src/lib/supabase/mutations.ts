"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import {
  sendInquiryNotification,
  sendInquiryConfirmation,
  sendApprovalNotification,
} from "@/lib/email";

// ─── 회원 관리 ───

export async function approveMember(userId: string, role: string = "approved") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, approved_at: new Date().toISOString() })
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

export async function deleteMember(userId: string) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
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
  preferred_program_id?: string;
  estimated_participants?: string;
  preferred_date?: string;
  budget_range?: string;
  message: string;
  user_id?: string;
}) {
  const supabase = await createClient();
  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .insert({ ...formData, status: "new" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // 로그인 사용자 + 프로그램 선택 시 수강 신청도 자동 생성
  if (formData.user_id && formData.preferred_program_id) {
    await supabase.from("enrollments").insert({
      user_id: formData.user_id,
      program_id: formData.preferred_program_id,
      inquiry_id: inquiry.id,
      status: "pending",
    });
  }

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
  revalidatePath("/admin/community/schedule");
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
  revalidatePath("/admin/community/schedule");
  revalidatePath("/admin/schedules");
  revalidatePath("/community/schedule");
}

export async function deleteSchedule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/community/schedule");
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
      is_profile_public: formData.is_profile_public ?? true,
      approved_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (profileError) throw new Error(profileError.message);

  // profile_card_url 별도 시도 (컬럼 없으면 무시)
  if (formData.profile_card_url) {
    await supabase
      .from("profiles")
      .update({ profile_card_url: formData.profile_card_url })
      .eq("id", authData.user.id)
      .then(() => {});
  }
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

  // profile_card_url은 DB 컬럼이 없을 수 있으므로 분리 처리
  const { profile_card_url, ...coreFields } = fields;
  const { error } = await supabase
    .from("profiles")
    .update(coreFields)
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // profile_card_url 별도 시도 (컬럼 없으면 무시)
  if (profile_card_url !== undefined) {
    await supabase
      .from("profiles")
      .update({ profile_card_url })
      .eq("id", userId)
      .then(() => {});
  }

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

// ─── 수강 신청 ───

export async function createEnrollment(
  userId: string,
  programId: string,
  inquiryId?: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    program_id: programId,
    inquiry_id: inquiryId || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
}

export async function approveEnrollment(id: string, fee: number, adminNote?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollments")
    .update({
      status: "approved",
      fee,
      admin_note: adminNote || null,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}

export async function updateEnrollmentStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollments")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── 강의공고 ───

export async function createLecture(formData: {
  title: string;
  description?: string;
  category_id?: string;
  location?: string;
  lecture_date?: string;
  lecture_time?: string;
  duration?: string;
  target?: string;
  required_count: number;
  fee?: string;
  requirements?: string;
  status?: string;
  deadline?: string;
  created_by?: string;
}) {
  const supabase = await createClient();
  const max_applicants = Math.ceil(formData.required_count * 1.5);
  const { data, error } = await supabase
    .from("lectures")
    .insert({
      ...formData,
      max_applicants,
      status: formData.status || "open",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lectures");
  revalidatePath("/lectures");
  return data;
}

export async function updateLecture(id: string, fields: Record<string, unknown>) {
  const supabase = await createClient();
  const updates: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() };
  if (fields.required_count) {
    updates.max_applicants = Math.ceil(Number(fields.required_count) * 1.5);
  }
  const { error } = await supabase.from("lectures").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lectures");
  revalidatePath("/lectures");
}

export async function deleteLecture(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("lectures").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lectures");
  revalidatePath("/lectures");
}

// ─── 강사 지원 ───

export async function createApplication(lectureId: string, applicantId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .insert({
      lecture_id: lectureId,
      applicant_id: applicantId,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateApplication(id: string, fields: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function selectApplicants(lectureId: string, selectedIds: string[]) {
  const supabase = await createClient();
  const { sendLectureSelectedNotification, sendLectureRejectedNotification } = await import("@/lib/kakao");

  // 강의 제목 조회 (알림용)
  const { data: lectureData } = await supabase
    .from("lectures")
    .select("title")
    .eq("id", lectureId)
    .single();
  const lectureTitle = lectureData?.title ?? "강의";

  // 선발된 지원자 상태 업데이트
  if (selectedIds.length > 0) {
    const { error: selectError } = await supabase
      .from("applications")
      .update({ status: "selected", selected_at: new Date().toISOString() })
      .in("id", selectedIds)
      .eq("lecture_id", lectureId);
    if (selectError) throw new Error(selectError.message);
  }

  // 나머지 지원자 미선발 처리
  let rejectQuery = supabase
    .from("applications")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("lecture_id", lectureId)
    .eq("status", "submitted");

  if (selectedIds.length > 0) {
    rejectQuery = rejectQuery.not("id", "in", `(${selectedIds.join(",")})`);
  }

  const { error: rejectError } = await rejectQuery;
  if (rejectError) throw new Error(rejectError.message);

  // 강의 상태를 closed로 변경
  await supabase
    .from("lectures")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", lectureId);

  // 카카오 알림톡 발송 (비동기, 실패해도 무관)
  const { data: allApps } = await supabase
    .from("applications")
    .select("id, applicant_id, status, profiles:applicant_id(phone)")
    .eq("lecture_id", lectureId)
    .in("status", ["selected", "rejected"]);

  if (allApps) {
    for (const app of allApps) {
      const phone = (app.profiles as { phone?: string } | null)?.phone;
      if (!phone) continue;
      if (app.status === "selected") {
        sendLectureSelectedNotification(phone, lectureTitle).catch(() => {});
      } else if (app.status === "rejected") {
        sendLectureRejectedNotification(phone, lectureTitle).catch(() => {});
      }
    }
  }

  revalidatePath(`/admin/lectures/${lectureId}/applicants`);
  revalidatePath("/admin/lectures");
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
