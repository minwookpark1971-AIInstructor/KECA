import { createClient } from "./server";
import type {
  Category,
  CategoryImage,
  Program,
  Profile,
  Post,
  Schedule,
  Payment,
  Inquiry,
  Enrollment,
  Partner,
  Lecture,
  LectureStatus,
  Application,
  StatusHistory,
  Notification,
  MarketingCampaign,
  MarketingSendLog,
  MarketingTemplate,
  MarketingGroup,
} from "@/types";

// ─── 카테고리 ───

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as Category[]) ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data as Category | null;
}

export async function getCategoryImages(categoryId: string): Promise<CategoryImage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("category_images")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order");
  return (data as CategoryImage[]) ?? [];
}

export async function getAllCategoryImages(): Promise<CategoryImage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("category_images")
    .select("*")
    .order("sort_order");
  return (data as CategoryImage[]) ?? [];
}

// ─── 교육프로그램 ───

export async function getPrograms(options?: {
  categorySlug?: string;
  programType?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Program[]> {
  const supabase = await createClient();
  let query = supabase
    .from("programs")
    .select("*, categories(*)")
    .eq("status", "published")
    .order("sort_order");

  if (options?.programType) {
    query = query.eq("program_type", options.programType);
  }
  if (options?.featured) {
    query = query.eq("is_featured", true);
  }
  if (options?.categorySlug) {
    query = query.eq("categories.slug", options.categorySlug);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data } = await query;

  // categorySlug 필터 시 join이 null인 항목 제거
  if (options?.categorySlug && data) {
    return data.filter((p: Record<string, unknown>) => p.categories !== null) as unknown as Program[];
  }

  return (data as unknown as Program[]) ?? [];
}

// 관리자용: 상태와 무관하게 전체 프로그램 조회
export async function getAllPrograms(): Promise<Program[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("*, categories(*)")
    .order("sort_order");
  return (data as unknown as Program[]) ?? [];
}

export async function getProgramById(id: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("*, categories(*)")
    .eq("id", id)
    .single();
  return data as unknown as Program | null;
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("*, categories(*)")
    .eq("slug", slug)
    .single();
  return data as unknown as Program | null;
}

export async function getProgramImages(programId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("program_images")
    .select("*")
    .eq("program_id", programId)
    .order("sort_order");
  return data ?? [];
}

export async function getProgramInstructors(programId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("program_instructors")
    .select("*, profiles(*)")
    .eq("program_id", programId);

  if (!data) return [];
  return data.map((pi: Record<string, unknown>) => pi.profiles).filter(Boolean) as unknown as Profile[];
}

// ─── 강사 ───

export async function getApprovedProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_status", "approved")
    .eq("is_instructor", false)
    .order("name");
  return (data as Profile[]) ?? [];
}

export async function getInstructors(categoryId?: string): Promise<Profile[]> {
  const supabase = await createClient();

  if (categoryId) {
    const { data } = await supabase
      .from("instructor_categories")
      .select("*, profiles(*)")
      .eq("category_id", categoryId);
    if (!data) return [];
    return data.map((ic: Record<string, unknown>) => ic.profiles).filter(Boolean) as unknown as Profile[];
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_instructor", true)
    .eq("is_profile_public", true)
    .order("name");
  return (data as Profile[]) ?? [];
}

export async function getInstructorById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  return data as Profile | null;
}

export async function getInstructorPrograms(instructorId: string): Promise<Program[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("program_instructors")
    .select("*, programs(*, categories(*))")
    .eq("instructor_id", instructorId);

  if (!data) return [];
  return data.map((pi: Record<string, unknown>) => pi.programs).filter(Boolean) as unknown as Program[];
}

// ─── 커뮤니티 게시판 ───

export async function getPostCount(boardType: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("board_type", boardType)
    .eq("status", "published");
  return count ?? 0;
}

export async function getPostsByBoardPaginated(
  boardType: string,
  page: number,
  perPage: number,
  search?: string
): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*")
    .eq("board_type", boardType)
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data } = await query;
  return (data as Post[]) ?? [];
}

export async function getPostsByBoard(
  boardType: string,
  limit?: number
): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*")
    .eq("board_type", boardType)
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  return (data as Post[]) ?? [];
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  return data as Post | null;
}

// ─── 교육일정 ───

export async function getSchedules(): Promise<Schedule[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schedules")
    .select("*")
    .order("start_date");
  return (data as Schedule[]) ?? [];
}

// ─── 사용자/인증 ───

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

// ─── 결제 ───

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as Payment[]) ?? [];
}

// ─── 교육문의 ───

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Inquiry[]) ?? [];
}

// ─── 관리자 ───

export async function getMembersForAdmin(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Profile[]) ?? [];
}

export async function getPayments(): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*, profiles(name, email)")
    .order("created_at", { ascending: false });
  return (data as unknown as Payment[]) ?? [];
}

// ─── 파트너 ───

export async function getPartners(): Promise<Partner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as Partner[]) ?? [];
}

export async function getAllPartners(): Promise<Partner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .order("sort_order");
  return (data as Partner[]) ?? [];
}

// ─── 수강 신청 ───

export async function getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("*, program:programs(id, title, slug, thumbnail_url, duration)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as Enrollment[]) ?? [];
}

export async function getEnrollmentsForAdmin(): Promise<Enrollment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("*, program:programs(id, title, slug), profile:profiles(id, name, email)")
    .order("created_at", { ascending: false });
  return (data as Enrollment[]) ?? [];
}

// ─── 사이트 콘텐츠 ───

export async function getSiteContent(key: string): Promise<unknown | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? null;
}

// ─── 강의공고 ───

export async function getLectures(status?: LectureStatus): Promise<Lecture[]> {
  const supabase = await createClient();
  let query = supabase
    .from("lectures")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data as unknown as Lecture[]) ?? [];
}

export async function getLectureById(id: string): Promise<Lecture | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lectures")
    .select("*, categories(*)")
    .eq("id", id)
    .single();
  return data as unknown as Lecture | null;
}

// ─── 강사 지원 ───

export async function getApplicationsByLecture(lectureId: string): Promise<Application[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("*, applicant:profiles(id, name, email, phone, specialties, bio, career_summary, profile_image_url, profile_pdf_url, role)")
    .eq("lecture_id", lectureId)
    .order("created_at", { ascending: false });
  return (data as unknown as Application[]) ?? [];
}

export async function getApplicationsByUser(userId: string): Promise<Application[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, lecture:lectures(id, title, lecture_date, location, status)")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as unknown as Application[]) ?? [];
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("*, lecture:lectures(*), applicant:profiles(*)")
    .eq("id", id)
    .single();
  return data as unknown as Application | null;
}

// ─── 상태 변경 이력 ───

export async function getStatusHistory(applicationId: string): Promise<StatusHistory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("application_status_history")
    .select("*, changer:profiles(id, name)")
    .eq("application_id", applicationId)
    .order("changed_at", { ascending: false });
  return (data as unknown as StatusHistory[]) ?? [];
}

// ─── 알림 ───

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data as unknown as Notification[]) ?? [];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

// ─── 마케팅 ───

export async function getMarketingCampaigns(): Promise<MarketingCampaign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data as unknown as MarketingCampaign[]) ?? [];
}

export async function getMarketingCampaignById(id: string): Promise<MarketingCampaign | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("id", id)
    .single();
  return data as unknown as MarketingCampaign | null;
}

export async function getMarketingSendLogs(campaignId: string): Promise<MarketingSendLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketing_send_logs")
    .select("*, recipient:recipient_id(name, email)")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  return (data as unknown as MarketingSendLog[]) ?? [];
}

export async function getMarketingTemplates(channel?: string): Promise<MarketingTemplate[]> {
  const supabase = await createClient();
  let query = supabase
    .from("marketing_templates")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (channel) query = query.eq("channel", channel);
  const { data } = await query;
  return (data as unknown as MarketingTemplate[]) ?? [];
}

export async function getAllMarketingTemplates(channel?: string): Promise<MarketingTemplate[]> {
  const supabase = await createClient();
  let query = supabase
    .from("marketing_templates")
    .select("*")
    .order("created_at", { ascending: false });
  if (channel) query = query.eq("channel", channel);
  const { data } = await query;
  return (data as unknown as MarketingTemplate[]) ?? [];
}

export async function getMembersByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids);
  return (data as unknown as Profile[]) ?? [];
}

export async function getMarketingGroups(): Promise<MarketingGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("marketing_groups")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as unknown as MarketingGroup[]) ?? [];
}

export async function getMarketingStats() {
  const supabase = await createClient();

  const { count: totalCampaigns } = await supabase
    .from("marketing_campaigns")
    .select("*", { count: "exact", head: true });

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const { count: thisMonthSent } = await supabase
    .from("marketing_campaigns")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("sent_at", thisMonth.toISOString());

  const { data: recentCampaigns } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalCampaigns: totalCampaigns ?? 0,
    thisMonthSent: thisMonthSent ?? 0,
    recentCampaigns: (recentCampaigns as unknown as MarketingCampaign[]) ?? [],
  };
}
