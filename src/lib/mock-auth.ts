import type { Profile, Payment } from "@/types";

// 목업 사용자 데이터 (Supabase 실연동 전 UI 구축용)
export const mockUsers: Profile[] = [
  {
    id: "admin-001",
    email: "admin@keca.or.kr",
    name: "관리자",
    phone: "010-1234-5678",
    role: "admin",
    approved_at: "2025-01-01",
    membership_paid_at: "2025-01-01",
    membership_expires_at: "2026-12-31",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
  {
    id: "member-001",
    email: "member@example.com",
    name: "김정회원",
    phone: "010-2345-6789",
    role: "member",
    approved_at: "2025-06-01",
    membership_paid_at: "2025-06-15",
    membership_expires_at: "2026-06-15",
    created_at: "2025-05-20",
    updated_at: "2025-06-15",
  },
  {
    id: "instructor-001",
    email: "instructor@example.com",
    name: "홍길동",
    phone: "010-3456-7890",
    role: "instructor",
    bio: "AI 교육 전문가로서 10년 이상의 교육 경력을 보유하고 있습니다. 기업 및 공공기관 대상 AI 활용 교육을 진행하고 있으며, 교육생 만족도 평균 4.8/5.0을 기록하고 있습니다.",
    career_summary: "現) KECA 소속 교육강사\n現) ○○대학교 AI융합학과 외래교수\n前) SK텔레콤 AI사업부 선임\n前) 한국교육학술정보원 연구원",
    specialties: ["AI교육", "데이터분석", "에듀테크"],
    is_profile_public: true,
    approved_at: "2025-03-01",
    membership_paid_at: "2025-03-15",
    membership_expires_at: "2026-03-15",
    created_at: "2025-02-20",
    updated_at: "2025-03-15",
  },
  {
    id: "pending-001",
    email: "pending@example.com",
    name: "이대기",
    phone: "010-4567-8901",
    role: "pending",
    created_at: "2026-03-20",
    updated_at: "2026-03-20",
  },
  {
    id: "approved-001",
    email: "approved@example.com",
    name: "박승인",
    phone: "010-5678-9012",
    role: "approved",
    approved_at: "2026-03-22",
    created_at: "2026-03-15",
    updated_at: "2026-03-22",
  },
];

// 목업 결제 내역
export const mockPayments: Payment[] = [
  {
    id: "pay-001",
    user_id: "member-001",
    payment_type: "annual_membership",
    amount: 100000,
    currency: "KRW",
    toss_order_id: "KECA_member001_1718438400000",
    toss_payment_key: "toss_pk_test_001",
    toss_method: "카드",
    status: "completed",
    paid_at: "2025-06-15",
    period_start: "2025-06-15",
    period_end: "2026-06-15",
    receipt_url: "#",
    created_at: "2025-06-15",
  },
  {
    id: "pay-002",
    user_id: "instructor-001",
    payment_type: "annual_membership",
    amount: 100000,
    currency: "KRW",
    status: "completed",
    paid_at: "2025-03-15",
    period_start: "2025-03-15",
    period_end: "2026-03-15",
    created_at: "2025-03-15",
  },
];

// 현재 로그인 사용자 (목업) — 'member-001'로 기본 설정
export function getMockCurrentUser(): Profile {
  return mockUsers.find((u) => u.id === "member-001")!;
}

export function getMockPayments(userId: string): Payment[] {
  return mockPayments.filter((p) => p.user_id === userId);
}

// 역할 라벨
export const roleLabels: Record<string, string> = {
  pending: "승인대기",
  approved: "승인완료",
  member: "정회원",
  instructor: "강사",
  admin: "관리자",
};

// 역할 배지 색상
export const roleBadgeColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  member: "bg-green-100 text-green-800",
  instructor: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};
