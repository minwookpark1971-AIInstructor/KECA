// ============================================================
// KECA 전체 TypeScript 타입 정의
// ============================================================

// ----- 사용자 역할 -----
export type UserRole = "pending" | "approved" | "associate" | "member" | "instructor" | "admin";

// ----- Profiles -----
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;

  // 강사 전용
  profile_image_url?: string;
  profile_card_url?: string;
  bio?: string;
  career_summary?: string;
  specialties?: string[];
  video_url?: string;
  is_profile_public?: boolean;

  // 회원 상태
  approved_at?: string;
  membership_paid_at?: string;
  membership_expires_at?: string;

  created_at: string;
  updated_at: string;
}

// ----- 카테고리 -----
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ----- 교육프로그램 -----
export type ProgramType = "education" | "expert" | "certification";
export type ProgramStatus = "draft" | "published" | "archived";

export interface CurriculumModule {
  module: string;
  title: string;
  topics: string[];
  hours: string;
}

export interface Program {
  id: string;
  category_id?: string;
  program_type: ProgramType;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  target_audience?: string;
  duration?: string;
  curriculum?: CurriculumModule[];
  learning_outcomes?: string[];
  methodology?: string;
  features?: string[];
  thumbnail_url?: string;
  status: ProgramStatus;
  is_featured: boolean;
  sort_order: number;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // 관계
  category?: Category;
  images?: ProgramImage[];
  instructors?: ProgramInstructor[];
}

export interface ProgramImage {
  id: string;
  program_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface ProgramInstructor {
  id: string;
  program_id: string;
  instructor_id: string;
  is_primary: boolean;
  assigned_at: string;
  instructor?: Profile;
}

// ----- 교육문의 -----
export type InquiryType = "corporate" | "institution" | "school" | "government" | "other";
export type InquiryStatus = "new" | "in_progress" | "completed" | "cancelled";

export interface Inquiry {
  id: string;
  inquiry_type: InquiryType;
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
  status: InquiryStatus;
  admin_note?: string;
  responded_at?: string;
  created_at: string;
}

// ----- 커뮤니티 게시판 -----
export type BoardType = "notice" | "review" | "photo_gallery" | "video_gallery" | "resource";
export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  board_type: BoardType;
  title: string;
  content?: string;
  thumbnail_url?: string;
  video_url?: string;
  file_url?: string;
  is_pinned?: boolean;
  view_count?: number;
  author_id?: string;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author?: Profile;
  images?: PostImage[];
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  caption?: string;
  sort_order: number;
}

// ----- 교육일정 -----
export type ScheduleStatus = "scheduled" | "ongoing" | "completed" | "cancelled";

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  program_id?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_online: boolean;
  status: ScheduleStatus;
  created_at: string;
  program?: Program;
}

// ----- 결제 -----
export type PaymentType = "annual_membership" | "certification_fee" | "program_fee";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled" | "refunded";

export interface Payment {
  id: string;
  user_id: string;
  payment_type: PaymentType;
  amount: number;
  currency: string;
  toss_order_id?: string;
  toss_payment_key?: string;
  toss_method?: string;
  status: PaymentStatus;
  paid_at?: string;
  period_start?: string;
  period_end?: string;
  receipt_url?: string;
  created_at: string;
}

// ----- 파트너 -----
export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ----- 사이트 설정 -----
export interface SiteSetting {
  key: string;
  value: unknown;
  updated_at: string;
  updated_by?: string;
}

// ----- GNB 메뉴 -----
export interface MenuItem {
  label: string;
  href: string;
  children?: MenuItem[];
  icon?: string;
}
