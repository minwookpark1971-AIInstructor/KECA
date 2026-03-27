import type { Program, Category, Profile, Schedule } from "@/types";

// 목업 카테고리
export const mockCategories: Category[] = [
  { id: "1", name: "AI·에듀테크 교육", slug: "ai-edutech", description: "생성형 AI, 업무자동화, 데이터 분석", icon_name: "cpu", sort_order: 1, is_active: true, created_at: "" },
  { id: "2", name: "진로·진학 컨설팅", slug: "career", description: "AI 기반 진로 진단, 대학 입시 컨설팅", icon_name: "compass", sort_order: 2, is_active: true, created_at: "" },
  { id: "3", name: "교육컨설팅", slug: "consulting", description: "교육과정 설계, 교육기관 운영", icon_name: "briefcase", sort_order: 3, is_active: true, created_at: "" },
  { id: "4", name: "리더십·조직교육", slug: "leadership", description: "교육리더십, 조직활성화", icon_name: "users", sort_order: 4, is_active: true, created_at: "" },
  { id: "5", name: "직무역량 강화", slug: "competency", description: "프레젠테이션, 보고서 작성, 디지털 리터러시", icon_name: "target", sort_order: 5, is_active: true, created_at: "" },
  { id: "6", name: "법정의무교육", slug: "mandatory", description: "개인정보보호, 직장내 성희롱 예방", icon_name: "shield", sort_order: 6, is_active: true, created_at: "" },
];

// 목업 프로그램
export const mockPrograms: Program[] = [
  {
    id: "p1", category_id: "1", program_type: "education", title: "생성형 AI 활용 교육", slug: "gen-ai-training",
    subtitle: "ChatGPT, Claude 등 생성형 AI를 업무에 활용하는 실전 교육", description: "생성형 AI 도구의 기초부터 업무 자동화까지 체계적으로 학습합니다.",
    target_audience: "기업 임직원", duration: "4시간",
    curriculum: [
      { module: "M1", title: "AI 기초 이해", topics: ["생성형 AI 개요", "주요 AI 도구 소개"], hours: "1h" },
      { module: "M2", title: "프롬프트 엔지니어링", topics: ["효과적인 프롬프트 작성법", "업무별 프롬프트 템플릿"], hours: "1.5h" },
      { module: "M3", title: "실전 활용 워크숍", topics: ["보고서 자동 작성", "데이터 분석 자동화"], hours: "1.5h" },
    ],
    learning_outcomes: ["생성형 AI 도구 활용 능력 습득", "업무 효율 30% 이상 향상", "AI 윤리 및 저작권 이해"],
    features: ["실습 중심 교육", "업종별 맞춤 사례", "교육 후 자료 제공"],
    status: "published", is_featured: true, sort_order: 1, created_at: "", updated_at: "",
  },
  {
    id: "p2", category_id: "1", program_type: "education", title: "AI 업무자동화", slug: "ai-automation",
    subtitle: "AI를 활용한 반복 업무 자동화 시스템 구축", description: "노코드/로코드 AI 도구로 업무 프로세스를 자동화합니다.",
    target_audience: "사무직 직장인", duration: "8시간(1일)",
    status: "published", is_featured: false, sort_order: 2, created_at: "", updated_at: "",
  },
  {
    id: "p3", category_id: "2", program_type: "education", title: "AI 기반 진로진단 프로그램", slug: "ai-career-diagnosis",
    subtitle: "AI 분석을 통한 맞춤형 진로 탐색", description: "AI 기반 진로 적성 진단과 맞춤형 진로 설계를 지원합니다.",
    target_audience: "중·고등학생", duration: "2시간",
    status: "published", is_featured: true, sort_order: 1, created_at: "", updated_at: "",
  },
  {
    id: "p4", category_id: "4", program_type: "education", title: "교육리더십 워크숍", slug: "edu-leadership-workshop",
    subtitle: "교육기관 관리자를 위한 리더십 역량 강화", description: "교육 현장에서의 리더십 역량을 체계적으로 개발합니다.",
    target_audience: "교육기관 관리자", duration: "8시간(1일)",
    status: "published", is_featured: true, sort_order: 1, created_at: "", updated_at: "",
  },
  {
    id: "p5", category_id: "3", program_type: "education", title: "교육과정 설계 컨설팅", slug: "curriculum-design",
    subtitle: "체계적 교육과정 설계 방법론", description: "교육 니즈 분석부터 교육과정 설계까지 체계적 방법론을 학습합니다.",
    target_audience: "교육담당자", duration: "6시간",
    status: "published", is_featured: false, sort_order: 1, created_at: "", updated_at: "",
  },
  {
    id: "p6", category_id: "5", program_type: "education", title: "프레젠테이션 스킬", slug: "presentation-skills",
    subtitle: "설득력 있는 프레젠테이션 기법", description: "기획부터 발표까지 전문적인 프레젠테이션 스킬을 배웁니다.",
    target_audience: "직장인", duration: "4시간",
    status: "published", is_featured: false, sort_order: 1, created_at: "", updated_at: "",
  },
];

// 목업 강사
export const mockInstructors: Profile[] = [
  {
    id: "i1", email: "hong@keca.or.kr", name: "홍길동", role: "instructor",
    bio: "AI 교육 분야 10년 경력의 전문 강사로, 기업 및 교육기관에서 다수의 AI 활용 교육을 진행하였습니다.",
    career_summary: "現) KECA 소속 교육강사\n現) ○○대학교 AI교육센터 외래교수\n前) SK텔레콤 AI사업부\n前) 한국교육개발원 연구원",
    specialties: ["AI교육", "데이터분석", "에듀테크"],
    is_profile_public: true, created_at: "", updated_at: "",
  },
  {
    id: "i2", email: "kim@keca.or.kr", name: "김철수", role: "instructor",
    bio: "진로교육 및 경력개발 컨설팅 전문가로, 학교 현장과 기업에서 폭넓은 경험을 보유하고 있습니다.",
    career_summary: "現) KECA 소속 교육강사\n前) ○○교육청 진로교육 전문위원\n前) ○○진로교육센터 센터장",
    specialties: ["진로교육", "경력개발", "교육컨설팅"],
    is_profile_public: true, created_at: "", updated_at: "",
  },
  {
    id: "i3", email: "lee@keca.or.kr", name: "이영희", role: "instructor",
    bio: "조직교육 및 리더십 분야 전문가로, 대기업 및 공공기관에서 다수의 교육과정을 설계·운영하였습니다.",
    career_summary: "現) KECA 소속 교육강사\n現) ○○대학원 교육학과 겸임교수\n前) 삼성전자 인재개발원",
    specialties: ["리더십", "조직교육", "교육과정설계"],
    is_profile_public: true, created_at: "", updated_at: "",
  },
];

export function getCategoryBySlug(slug: string) {
  return mockCategories.find((c) => c.slug === slug);
}

export function getProgramsByCategory(categorySlug?: string) {
  if (!categorySlug) return mockPrograms.filter((p) => p.status === "published");
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return [];
  return mockPrograms.filter((p) => p.category_id === cat.id && p.status === "published");
}

export function getProgramBySlug(slug: string) {
  return mockPrograms.find((p) => p.slug === slug);
}

export function getCategoryById(id: string) {
  return mockCategories.find((c) => c.id === id);
}
