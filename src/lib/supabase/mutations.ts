"use server";

import { createAdminClient } from "./admin";
import { revalidatePath } from "next/cache";
import {
  sendInquiryNotification,
  sendInquiryConfirmation,
  sendApprovalNotification,
} from "@/lib/email";

// ─── 회원 관리 ───

export async function approveMember(userId: string, role: string = "approved") {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, approved_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // 이메일 인증 자동 확인 (승인 시 로그인 가능하도록)
  await supabase.auth.admin.updateUserById(userId, { email_confirm: true });

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
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
}

export async function deleteMember(userId: string) {
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("programs")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/programs");
  revalidatePath(`/programs`);
}

export async function deleteProgram(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

// ─── 과정소개 이미지 ───

export async function addProgramImage(programId: string, imageUrl: string, sortOrder: number) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("program_images")
    .insert({ program_id: programId, image_url: imageUrl, sort_order: sortOrder });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/programs");
}

export async function deleteProgramImage(imageId: string, programId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("program_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/programs/${programId}`);
  revalidatePath("/programs");
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("posts")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/community");
  revalidatePath("/community");
}

export async function deletePost(id: string, boardType: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/community/${boardType}`);
  revalidatePath("/community");
}

// ─── 교육문의 ───

export async function updateInquiryStatus(id: string, status: string) {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partners")
    .update(fields)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partners");
}

export async function deletePartner(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partners");
}

// ─── 강사 프로필 검토 (Admin) ───

export async function approveInstructorProfile(userId: string) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ profile_status: "approved", profile_reject_reason: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
}

export async function rejectInstructorProfile(userId: string, reason: string) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ profile_status: "rejected", profile_reject_reason: reason })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
}

export async function resetInstructorProfile(userId: string) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ profile_status: "rejected", profile_reject_reason: "관리자 요청에 의한 재작성" })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
  revalidatePath("/admin/instructors");
}

// ─── 강사 승격/해제 (Admin) ───

export async function promoteToInstructor(
  userId: string,
  fields?: { profile_card_url?: string; is_profile_public?: boolean }
) {
  const supabase = createAdminClient();

  // 기본 필드만 먼저 업데이트 (항상 존재하는 컬럼)
  const { error } = await supabase
    .from("profiles")
    .update({
      is_instructor: true,
      is_profile_public: fields?.is_profile_public ?? true,
      approved_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // profile_card_url은 컬럼이 없을 수 있으므로 별도 시도 (실패해도 무시)
  if (fields?.profile_card_url !== undefined) {
    await supabase
      .from("profiles")
      .update({ profile_card_url: fields.profile_card_url })
      .eq("id", userId)
      .then(() => {});
  }

  revalidatePath("/admin/instructors");
  revalidatePath("/admin/members");
  revalidatePath("/instructors");
}

export async function demoteInstructor(userId: string) {
  const { createAdminClient } = await import("./admin");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_instructor: false, is_profile_public: false })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/instructors");
  revalidatePath("/admin/members");
  revalidatePath("/instructors");
}

// ─── 강사 등록 (Admin) — @deprecated: promoteToInstructor 사용 권장 ───

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
      role: "associate",
      is_instructor: true,
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
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categories")
    .insert({ ...formData, is_active: true, sort_order: formData.sort_order ?? 99 });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/programs");
}

export async function updateCategory(id: string, fields: Record<string, unknown>) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/programs");
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/programs");
}

// ─── 카테고리 소개 이미지 ───

export async function addCategoryImage(categoryId: string, imageUrl: string, sortOrder: number) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("category_images")
    .insert({ category_id: categoryId, image_url: imageUrl, sort_order: sortOrder });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/programs");
}

export async function deleteCategoryImage(imageId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("category_images").delete().eq("id", imageId);
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
  const supabase = createAdminClient();
  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    program_id: programId,
    inquiry_id: inquiryId || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
}

export async function approveEnrollment(id: string, fee: number, adminNote?: string) {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const max_applicants = Math.ceil(formData.required_count * 1.5);
  // 빈 문자열을 제거하여 UUID 등 타입 에러 방지
  const cleanData = Object.fromEntries(
    Object.entries(formData).filter(([, v]) => v !== "")
  );
  const { data, error } = await supabase
    .from("lectures")
    .insert({
      ...cleanData,
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { error } = await supabase.from("lectures").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/lectures");
  revalidatePath("/lectures");
}

// ─── 강사 지원 ───

export async function createApplication(lectureId: string, applicantId: string) {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("applications")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function selectApplicants(lectureId: string, selectedIds: string[], standbyIds: string[] = []) {
  const supabase = createAdminClient();
  const { sendLectureSelectedNotification, sendLectureRejectedNotification } = await import("@/lib/kakao");

  // 강의 제목 조회 (알림용)
  const { data: lectureData } = await supabase
    .from("lectures")
    .select("title")
    .eq("id", lectureId)
    .single();
  const lectureTitle = lectureData?.title ?? "강의";

  // 1. 강사확정 처리
  if (selectedIds.length > 0) {
    const { error: selectError } = await supabase
      .from("applications")
      .update({ status: "selected", selected_at: new Date().toISOString() })
      .in("id", selectedIds)
      .eq("lecture_id", lectureId);
    if (selectError) throw new Error(selectError.message);
  }

  // 2. 예비강사 처리
  if (standbyIds.length > 0) {
    const { error: standbyError } = await supabase
      .from("applications")
      .update({ status: "standby", updated_at: new Date().toISOString() })
      .in("id", standbyIds)
      .eq("lecture_id", lectureId);
    if (standbyError) throw new Error(standbyError.message);
  }

  // 3. 미선발 처리 (나머지 submitted 지원자)
  const excludeIds = [...selectedIds, ...standbyIds];
  const rejectNote = "이번 강의에 함께하지 못하게 되어 죄송합니다. 다음 기회에 꼭 함께하길 바랍니다. 보증금은 3영업일 이내 환불됩니다.";

  let rejectQuery = supabase
    .from("applications")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      admin_note: rejectNote,
    })
    .eq("lecture_id", lectureId)
    .eq("status", "submitted");

  if (excludeIds.length > 0) {
    rejectQuery = rejectQuery.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { error: rejectError } = await rejectQuery;
  if (rejectError) throw new Error(rejectError.message);

  // 4. 강의 상태를 closed로 변경
  await supabase
    .from("lectures")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", lectureId);

  // 5. 카카오 알림톡 발송 (비동기, 실패해도 무관)
  const { data: allApps } = await supabase
    .from("applications")
    .select("id, applicant_id, status, profiles:applicant_id(phone)")
    .eq("lecture_id", lectureId)
    .in("status", ["selected", "standby", "rejected"]);

  if (allApps) {
    for (const app of allApps) {
      const phone = (app.profiles as { phone?: string } | null)?.phone;
      if (!phone) continue;
      if (app.status === "selected") {
        sendLectureSelectedNotification(phone, lectureTitle).catch(() => {});
      } else if (app.status === "rejected") {
        sendLectureRejectedNotification(phone, lectureTitle).catch(() => {});
      }
      // standby는 별도 알림 (추후 카카오 템플릿 추가 시)
    }
  }

  revalidatePath(`/admin/lectures/${lectureId}/applicants`);
  revalidatePath("/admin/lectures");
  revalidatePath("/mypage/applications");
}

// ─── 개별 상태 변경 ───

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  adminId: string,
  options?: { standby_rank?: number; rejection_reason?: string; memo?: string }
) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // 현재 상태 조회
  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("status, lecture_id, applicant_id")
    .eq("id", applicationId)
    .single();
  if (fetchError || !app) throw new Error("지원 정보를 찾을 수 없습니다.");

  const previousStatus = app.status;

  // 상태 업데이트 (원본 스키마 컬럼만)
  const updates: Record<string, unknown> = {
    status: newStatus,
    updated_at: now,
  };
  if (newStatus === "selected") updates.selected_at = now;
  if (newStatus === "rejected") updates.rejected_at = now;

  const { error: updateError } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", applicationId);
  if (updateError) throw new Error(updateError.message);

  // 009 마이그레이션 확장 컬럼 (없으면 무시)
  try {
    const extUpdates: Record<string, unknown> = {
      status_changed_at: now,
      status_changed_by: adminId,
      is_result_read: false,
    };
    if (newStatus === "standby" && options?.standby_rank != null) {
      extUpdates.standby_rank = options.standby_rank;
    } else if (newStatus !== "standby") {
      extUpdates.standby_rank = null;
    }
    if (newStatus === "rejected" && options?.rejection_reason) {
      extUpdates.rejection_reason = options.rejection_reason;
    } else if (newStatus !== "rejected") {
      extUpdates.rejection_reason = null;
    }
    await supabase.from("applications").update(extUpdates).eq("id", applicationId);
  } catch { /* 009 미적용 시 무시 */ }

  // 이력 기록 (테이블 없으면 무시)
  try {
    await supabase.from("application_status_history").insert({
      application_id: applicationId,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: adminId,
      changed_at: now,
      memo: options?.memo ?? null,
    });
  } catch { /* 009 미적용 시 무시 */ }

  // 알림 생성 (테이블 없으면 무시)
  if (["selected", "standby", "rejected"].includes(newStatus)) {
    try {
      const { data: lecture } = await supabase
        .from("lectures")
        .select("title")
        .eq("id", app.lecture_id)
        .single();
      const lectureTitle = lecture?.title ?? "강의";

      const messages: Record<string, { title: string; message: string }> = {
        selected: {
          title: `[${lectureTitle}] 강사로 확정되었습니다`,
          message: "축하합니다! 강사로 선발되셨습니다. 상세 내용을 확인해주세요.",
        },
        standby: {
          title: `[${lectureTitle}] 예비강사로 선정되었습니다`,
          message: "예비강사로 선정되었습니다. 확정 강사 변동 시 안내드리겠습니다.",
        },
        rejected: {
          title: `[${lectureTitle}] 선발 결과 안내`,
          message: "아쉽게도 이번 강의에 선발되지 않았습니다. 다음 기회에 함께하길 바랍니다.",
        },
      };

      const msg = messages[newStatus];
      if (msg) {
        await supabase.from("notifications").insert({
          user_id: app.applicant_id,
          type: "application_status_changed",
          title: msg.title,
          message: msg.message,
          reference_id: applicationId,
          reference_url: `/mypage/applications/${applicationId}`,
        });
      }
    } catch { /* 009 미적용 시 무시 */ }
  }

  revalidatePath(`/admin/lectures/${app.lecture_id}/applicants`);
  revalidatePath("/mypage/applications");
}

// ─── 일괄 상태 변경 ───

export async function bulkUpdateApplicationStatus(
  lectureId: string,
  changes: { id: string; status: string; standby_rank?: number; rejection_reason?: string }[],
  adminId: string
) {
  for (const change of changes) {
    await updateApplicationStatus(change.id, change.status, adminId, {
      standby_rank: change.standby_rank,
      rejection_reason: change.rejection_reason,
    });
  }
  revalidatePath(`/admin/lectures/${lectureId}/applicants`);
  revalidatePath("/mypage/applications");
}

// ─── 알림 관리 ───

export async function markNotificationRead(notificationId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw new Error(error.message);
}

export async function markApplicationResultRead(applicationId: string) {
  try {
    const supabase = createAdminClient();
    await supabase
      .from("applications")
      .update({ is_result_read: true })
      .eq("id", applicationId);
  } catch { /* 009 미적용 시 무시 */ }
}

// ─── 지원 삭제 ───

export async function deleteApplication(applicationId: string, userId: string, isAdmin: boolean = false) {
  const supabase = createAdminClient();

  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("status, applicant_id, lecture_id, document_urls")
    .eq("id", applicationId)
    .single();
  if (fetchError || !app) throw new Error("지원 정보를 찾을 수 없습니다.");

  // 권한 확인
  if (!isAdmin && app.applicant_id !== userId) {
    throw new Error("본인의 지원만 삭제할 수 있습니다.");
  }

  // 회원은 cancelled 상태만 삭제 가능, 관리자는 모든 상태 삭제 가능
  if (!isAdmin && app.status !== "cancelled") {
    throw new Error("취소된 지원만 삭제할 수 있습니다.");
  }

  // Storage에서 첨부 파일 삭제
  const docs = (app.document_urls as { name: string; url: string }[]) ?? [];
  for (const doc of docs) {
    const path = doc.url.split("/portfolios/")[1];
    if (path) {
      await supabase.storage.from("portfolios").remove([decodeURIComponent(path)]).catch(() => {});
    }
  }

  // 이력 삭제 (009 미적용 시 무시)
  try {
    await supabase
      .from("application_status_history")
      .delete()
      .eq("application_id", applicationId);
  } catch { /* 무시 */ }

  // 알림 삭제 (009 미적용 시 무시)
  try {
    await supabase
      .from("notifications")
      .delete()
      .eq("reference_id", applicationId);
  } catch { /* 무시 */ }

  // 지원 레코드 삭제
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId);
  if (error) throw new Error(error.message);

  revalidatePath("/mypage/applications");
  revalidatePath(`/admin/lectures/${app.lecture_id}/applicants`);
}

// ─── 지원 취소 ───

export async function cancelApplication(applicationId: string, userId: string) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("status, lecture_id, applicant_id")
    .eq("id", applicationId)
    .single();
  if (fetchError || !app) throw new Error("지원 정보를 찾을 수 없습니다.");
  if (app.applicant_id !== userId) throw new Error("본인의 지원만 취소할 수 있습니다.");
  if (!["pending", "submitted", "reviewing"].includes(app.status)) {
    throw new Error("현재 상태에서는 지원을 취소할 수 없습니다.");
  }

  const { error } = await supabase
    .from("applications")
    .update({ status: "cancelled", updated_at: now })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);

  // 확장 필드 + 이력 기록 (009 미적용 시 무시)
  try {
    await supabase.from("applications")
      .update({ status_changed_at: now })
      .eq("id", applicationId);
  } catch { /* 무시 */ }
  try {
    await supabase.from("application_status_history").insert({
      application_id: applicationId,
      previous_status: app.status,
      new_status: "cancelled",
      changed_by: userId,
      changed_at: now,
      memo: "지원자 본인 취소",
    });
  } catch { /* 무시 */ }

  revalidatePath("/mypage/applications");
  revalidatePath(`/admin/lectures/${app.lecture_id}/applicants`);
}

// ─── 서류 관리 ───

export async function updateApplicationDocuments(
  applicationId: string,
  userId: string,
  documentUrls: { name: string; url: string }[],
  coverLetter: string,
  autoSubmit: boolean = false
) {
  const supabase = createAdminClient();

  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("status, applicant_id, lecture_id")
    .eq("id", applicationId)
    .single();
  if (fetchError || !app) throw new Error("지원 정보를 찾을 수 없습니다.");
  if (app.applicant_id !== userId) throw new Error("본인의 지원만 수정할 수 있습니다.");
  if (!["pending", "submitted"].includes(app.status)) {
    throw new Error("현재 상태에서는 서류를 수정할 수 없습니다.");
  }

  const updates: Record<string, unknown> = {
    document_urls: documentUrls,
    cover_letter: coverLetter,
    portfolio_url: documentUrls.length > 0 ? documentUrls[0].url : null,
    updated_at: new Date().toISOString(),
  };

  // pending 상태에서 서류 첨부 시 자동으로 submitted 전환
  if (autoSubmit && app.status === "pending" && (documentUrls.length > 0 || coverLetter.trim())) {
    updates.status = "submitted";
  }

  const { error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", applicationId);
  if (error) throw new Error(error.message);

  revalidatePath(`/mypage/applications/${applicationId}`);
  revalidatePath("/mypage/applications");
  revalidatePath(`/admin/lectures/${app.lecture_id}/applicants`);
}

export async function deleteApplicationFile(
  applicationId: string,
  userId: string,
  fileUrl: string
) {
  const supabase = createAdminClient();

  const { data: app, error: fetchError } = await supabase
    .from("applications")
    .select("status, applicant_id, document_urls, lecture_id")
    .eq("id", applicationId)
    .single();
  if (fetchError || !app) throw new Error("지원 정보를 찾을 수 없습니다.");
  if (app.applicant_id !== userId) throw new Error("본인의 서류만 삭제할 수 있습니다.");
  if (!["pending", "submitted"].includes(app.status)) {
    throw new Error("현재 상태에서는 서류를 삭제할 수 없습니다.");
  }

  // Storage에서 파일 삭제
  const path = fileUrl.split("/portfolios/")[1];
  if (path) {
    await supabase.storage.from("portfolios").remove([decodeURIComponent(path)]);
  }

  // document_urls에서 해당 파일 제거
  const currentDocs = (app.document_urls as { name: string; url: string }[]) ?? [];
  const updatedDocs = currentDocs.filter((d) => d.url !== fileUrl);

  const { error } = await supabase
    .from("applications")
    .update({
      document_urls: updatedDocs,
      portfolio_url: updatedDocs.length > 0 ? updatedDocs[0].url : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);

  revalidatePath(`/mypage/applications/${applicationId}`);
  revalidatePath("/mypage/applications");
  revalidatePath(`/admin/lectures/${app.lecture_id}/applicants`);
}

// ─── 마케팅: 다운로드 감사 로그 ───

export async function logDownloadAudit(params: {
  adminId: string;
  downloadType: string;
  recordCount: number;
  filtersApplied: Record<string, unknown>;
  fieldsIncluded: string[];
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("download_audit_logs").insert({
    admin_id: params.adminId,
    download_type: params.downloadType,
    record_count: params.recordCount,
    filters_applied: params.filtersApplied,
    fields_included: params.fieldsIncluded,
  });
  if (error) throw new Error(error.message);
}

// ─── 마케팅: 캠페인 ───

export async function createMarketingCampaign(data: {
  title: string;
  channel: string;
  subject?: string;
  body?: string;
  template_id?: string;
  sender_name?: string;
  sender_email?: string;
  scheduled_at?: string;
  total_recipients: number;
  created_by?: string;
}) {
  const supabase = createAdminClient();
  const { data: campaign, error } = await supabase
    .from("marketing_campaigns")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing");
  revalidatePath("/admin/marketing/history");
  return campaign;
}

export async function updateMarketingCampaign(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("marketing_campaigns")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing");
  revalidatePath("/admin/marketing/history");
}

// ─── 마케팅: 발송 로그 ───

export async function createMarketingSendLogs(
  logs: {
    campaign_id: string;
    recipient_id: string;
    recipient_email?: string;
    recipient_phone?: string;
    channel: string;
  }[]
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("marketing_send_logs").insert(logs);
  if (error) throw new Error(error.message);
}

export async function updateMarketingSendLog(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("marketing_send_logs")
    .update(fields)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── 마케팅: 템플릿 ───

export async function createMarketingTemplate(data: {
  name: string;
  channel: string;
  subject?: string;
  body: string;
  variables?: string[];
  type?: string;
  kakao_template_code?: string;
  kakao_status?: string;
  created_by?: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("marketing_templates").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/templates");
}

export async function updateMarketingTemplate(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("marketing_templates")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/templates");
}

export async function deleteMarketingTemplate(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("marketing_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/templates");
}

// ─── 마케팅: 수신 그룹 ───

export async function createMarketingGroup(data: {
  name: string;
  description?: string;
  group_type?: "static" | "dynamic";
  filter_criteria?: Record<string, unknown>;
  member_ids?: string[];
  created_by?: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("marketing_groups").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/groups");
}

export async function updateMarketingGroup(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("marketing_groups")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/groups");
}

export async function deleteMarketingGroup(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("marketing_groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/groups");
}

export async function addMembersToGroup(groupId: string, memberIds: string[]) {
  const supabase = createAdminClient();
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
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/groups");
}

export async function removeMemberFromGroup(groupId: string, memberId: string) {
  const supabase = createAdminClient();
  const { data: group } = await supabase
    .from("marketing_groups")
    .select("member_ids")
    .eq("id", groupId)
    .single();
  const existing = (group?.member_ids as string[]) || [];
  const filtered = existing.filter((id) => id !== memberId);
  const { error } = await supabase
    .from("marketing_groups")
    .update({
      member_ids: filtered,
      member_count: filtered.length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/groups");
}

// ─── 마케팅: 캠페인 삭제 (소프트 삭제) ───

export async function deleteMarketingCampaigns(ids: string[]) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("marketing_campaigns")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marketing/history");
  revalidatePath("/admin/marketing");
}

// ─── 사이트 설정 ───

export async function saveSiteSettings(
  settings: { key: string; value: unknown }[]
) {
  const supabase = createAdminClient();
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
