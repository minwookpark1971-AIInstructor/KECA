const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://gfqjpbcjldqnsrqpehkt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWpwYmNqbGRxbnNycXBlaGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYwNTA2NiwiZXhwIjoyMDkwMTgxMDY2fQ.viHLTA5gH-GFI7cu-Yf0Xn6Dx6M02JebR-mRKUYhdaA",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const programs = [
  // 자격증 과정 (certification)
  {
    program_type: "certification", title: "인공지능(AI)교육전문가 1급", slug: "ai-edu-expert",
    subtitle: "생성형 AI 활용 교육 전문가 양성",
    description: "AI 기술을 교육에 접목하여 효과적인 교수-학습을 설계하고 운영할 수 있는 전문가를 양성하는 자격증 과정입니다. 생성형 AI 도구 활용, 교육 콘텐츠 개발, AI 윤리 등을 체계적으로 학습합니다.",
    target_audience: "교육자, AI 교육 전문가 희망자", duration: "8주 과정",
    features: ["생성형 AI 도구 실습", "교육 콘텐츠 개발", "AI 윤리와 교육 정책", "자격시험 대비"],
    learning_outcomes: ["AI 교육 설계 역량", "생성형 AI 도구 활용 능력", "AI 교육전문가 1급 자격 취득"],
    methodology: "이론 30% + 실습 50% + 시험 20%", status: "published", is_featured: false, sort_order: 1,
  },
  {
    program_type: "certification", title: "교육컨설턴트 자격과정", slug: "edu-consultant",
    subtitle: "교육과정 설계 및 컨설팅 전문가",
    description: "기업 및 기관의 교육 니즈를 분석하고, 최적의 교육 솔루션을 설계·제안하는 교육컨설턴트 전문가를 양성합니다.",
    target_audience: "HRD 담당자, 교육기획자", duration: "6주 과정",
    features: ["교육 니즈 분석", "커리큘럼 설계", "교육 효과성 측정", "컨설팅 프레젠테이션"],
    learning_outcomes: ["교육컨설팅 방법론 습득", "교육과정 설계 역량", "교육컨설턴트 자격 취득"],
    methodology: "이론 40% + 사례연구 30% + 프로젝트 30%", status: "published", is_featured: false, sort_order: 2,
  },
  {
    program_type: "certification", title: "에듀테크 지도사 과정", slug: "edutech-instructor-cert",
    subtitle: "에듀테크 도구 활용 지도 전문가",
    description: "최신 에듀테크 도구와 플랫폼을 활용하여 효과적인 교육을 운영할 수 있는 지도사를 양성하는 과정입니다.",
    target_audience: "교사, 강사, 교육 담당자", duration: "4주 과정",
    features: ["에듀테크 도구 실습", "온라인 교육 설계", "학습 데이터 분석", "에듀테크 트렌드"],
    learning_outcomes: ["에듀테크 도구 활용 역량", "온라인 교육 운영 능력", "에듀테크 지도사 자격 취득"],
    methodology: "이론 20% + 실습 60% + 평가 20%", status: "published", is_featured: false, sort_order: 3,
  },

  // 강사양성 과정 (expert)
  {
    program_type: "expert", title: "AI교육 강사양성 과정", slug: "ai-instructor-training",
    subtitle: "AI 활용 교육 강사 양성 프로그램",
    description: "AI 기술을 교육 현장에 적용할 수 있는 전문 강사를 양성합니다. 프롬프트 엔지니어링, 데이터 분석, AI 영상 제작 등 실무 중심 교육을 제공합니다.",
    target_audience: "현직 강사, 교육자, 전직 희망자", duration: "8주 과정 (주 1회)",
    features: ["프롬프트 엔지니어링", "AI 콘텐츠 제작", "강의 설계 방법론", "실전 강의 실습"],
    learning_outcomes: ["AI 교육 강의 역량", "교육 콘텐츠 제작 능력", "전문 강사 포트폴리오 구축"],
    methodology: "이론 20% + 실습 60% + 모의강의 20%", status: "published", is_featured: false, sort_order: 4,
  },
  {
    program_type: "expert", title: "진로교육 강사양성 과정", slug: "career-instructor-training",
    subtitle: "진로·진학 교육 강사 양성",
    description: "청소년 및 대학생 대상 진로교육을 전문적으로 수행할 수 있는 강사를 양성합니다. AI 진로진단 도구 활용법과 진로 상담 기법을 학습합니다.",
    target_audience: "진로상담사, 교사, 강사 희망자", duration: "6주 과정",
    features: ["AI 진로진단 도구", "진로 상담 기법", "진로교육 프로그램 설계", "실전 강의 연습"],
    learning_outcomes: ["진로교육 전문 역량", "AI 진단 도구 활용", "진로교육 강사 자격"],
    methodology: "이론 30% + 실습 40% + 상담실습 30%", status: "published", is_featured: false, sort_order: 5,
  },
  {
    program_type: "expert", title: "교육컨설팅 강사양성 과정", slug: "consulting-instructor-training",
    subtitle: "교육컨설팅 분야 강사 양성",
    description: "기업·기관 대상 교육컨설팅 강의를 수행할 수 있는 전문 강사를 양성합니다. 니즈 분석부터 교육 설계, 강의 전달까지 전 과정을 학습합니다.",
    target_audience: "컨설턴트, 강사, 교육기획자", duration: "6주 과정",
    features: ["교육 니즈 분석", "맞춤 교육 설계", "퍼실리테이션 기법", "강의 전달 스킬"],
    learning_outcomes: ["교육컨설팅 강의 역량", "퍼실리테이션 능력", "컨설팅 강사 자격"],
    methodology: "이론 30% + 워크숍 40% + 모의강의 30%", status: "published", is_featured: false, sort_order: 6,
  },

  // 보수교육 (expert)
  {
    program_type: "expert", title: "연간 보수교육", slug: "annual-continuing-education",
    subtitle: "자격 유지를 위한 연간 보수교육",
    description: "KECA 자격증 보유자를 위한 연간 보수교육입니다. 최신 교육 트렌드, AI 기술 동향, 법규 변경사항 등을 학습하여 전문성을 유지합니다.",
    target_audience: "KECA 자격증 보유자", duration: "8시간 (1일)",
    features: ["최신 교육 트렌드", "AI 기술 업데이트", "법규 변경사항", "사례 공유"],
    learning_outcomes: ["최신 트렌드 이해", "자격 유지 요건 충족", "전문성 업데이트"],
    methodology: "강의 50% + 사례연구 30% + 토론 20%", status: "published", is_featured: false, sort_order: 7,
  },
  {
    program_type: "expert", title: "역량강화 워크숍", slug: "competency-workshop",
    subtitle: "전문 역량 심화 워크숍",
    description: "특정 분야의 전문 역량을 심화할 수 있는 집중 워크숍입니다. 분기별 다양한 주제로 운영됩니다.",
    target_audience: "KECA 강사, 자격증 보유자", duration: "4시간 (반일)",
    features: ["분야별 심화 학습", "실습 중심 워크숍", "네트워킹", "최신 사례 공유"],
    learning_outcomes: ["전문 분야 심화 역량", "실무 적용 능력", "동료 네트워크 확장"],
    methodology: "실습 60% + 토론 30% + 네트워킹 10%", status: "published", is_featured: false, sort_order: 8,
  },
];

async function seed() {
  const { data, error } = await supabase
    .from("programs")
    .insert(programs)
    .select("id, title, program_type");

  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Inserted", data.length, "expert programs:");
    data.forEach((d) => console.log(` [${d.program_type}] ${d.title}`));
  }
}

seed().catch(console.error);
