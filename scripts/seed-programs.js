const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://gfqjpbcjldqnsrqpehkt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWpwYmNqbGRxbnNycXBlaGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYwNTA2NiwiZXhwIjoyMDkwMTgxMDY2fQ.viHLTA5gH-GFI7cu-Yf0Xn6Dx6M02JebR-mRKUYhdaA",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CAT = {
  ai: "6f1c8ba2-db5c-4fcc-ae89-00affa0f88da",
  career: "5ddd72dc-dd8f-4f4b-b3f1-f1436be88694",
  consulting: "5b3d995e-09ba-4da7-9155-5ba2d920936a",
  leadership: "b4ec2c8c-4ae2-4d0b-af2a-ea5432144c66",
  competency: "e1caca7b-7d48-4bae-8a75-a5b9a5b89362",
  mandatory: "2e47d13e-55f5-4ca0-8395-31483b14914f",
};

const programs = [
  // AI·에듀테크 (4개)
  {
    category_id: CAT.ai, program_type: "education", title: "생성형 AI 업무자동화 특강", slug: "ai-work-automation",
    subtitle: "ChatGPT·Copilot을 활용한 업무 생산성 혁신",
    description: "생성형 AI 도구를 활용하여 문서 작성, 데이터 분석, 이메일 작성 등 반복적인 업무를 자동화하고, 업무 생산성을 획기적으로 향상시키는 실무 중심 교육입니다.",
    target_audience: "기업 임직원, 공공기관 직원", duration: "4시간 (반일)",
    features: ["ChatGPT, Copilot 등 최신 AI 도구 실습", "업무 시나리오별 프롬프트 설계 방법론", "실제 업무 문서 자동화 실습", "AI 윤리와 보안 가이드라인"],
    curriculum: [
      { module: "M1", title: "AI 시대의 업무 변화", topics: ["생성형 AI 개요", "주요 AI 도구 소개", "업무 활용 사례"], hours: "1H" },
      { module: "M2", title: "프롬프트 엔지니어링", topics: ["효과적인 프롬프트 작성법", "역할 지정과 맥락 설정", "반복 개선 기법"], hours: "1H" },
      { module: "M3", title: "업무 자동화 실습", topics: ["문서 작성 자동화", "데이터 분석 자동화", "이메일/보고서 자동화"], hours: "1.5H" },
      { module: "M4", title: "AI 윤리와 보안", topics: ["AI 활용 시 주의사항", "개인정보보호", "기업 내 AI 정책"], hours: "0.5H" },
    ],
    learning_outcomes: ["AI 도구를 활용한 업무 시간 50% 단축", "효과적인 프롬프트 설계 능력 습득", "AI 기반 업무 프로세스 재설계 역량"],
    methodology: "이론 20% + 실습 60% + 사례연구 20%", is_featured: true, sort_order: 1,
  },
  {
    category_id: CAT.ai, program_type: "education", title: "AI 데이터 분석 실무", slug: "ai-data-analysis",
    subtitle: "데이터 기반 의사결정을 위한 AI 분석 역량",
    description: "AI 도구를 활용하여 기업 데이터를 수집·분석·시각화하고, 데이터 기반의 전략적 의사결정을 내릴 수 있는 실무 역량을 배양하는 교육입니다.",
    target_audience: "기업 실무자, 마케팅/기획 담당자", duration: "8시간 (1일)",
    features: ["AI 기반 데이터 수집 및 전처리", "시각화 도구 활용 실습", "비즈니스 인사이트 도출 방법론", "실무 데이터셋 활용 실습"],
    curriculum: [
      { module: "M1", title: "데이터 분석 기초", topics: ["데이터 리터러시", "AI 분석 도구 소개", "데이터 수집 방법"], hours: "2H" },
      { module: "M2", title: "AI 활용 데이터 분석", topics: ["ChatGPT로 데이터 분석", "AI 시각화 도구 실습", "패턴 발견과 인사이트"], hours: "3H" },
      { module: "M3", title: "비즈니스 적용", topics: ["마케팅 데이터 분석", "매출 예측 모델", "분석 보고서 작성"], hours: "3H" },
    ],
    learning_outcomes: ["AI 도구를 활용한 데이터 분석 역량", "데이터 기반 보고서 작성 능력", "비즈니스 인사이트 도출 역량"],
    methodology: "이론 30% + 실습 50% + 프로젝트 20%", is_featured: true, sort_order: 2,
  },
  {
    category_id: CAT.ai, program_type: "education", title: "AI 영상 크리에이터", slug: "ai-video-creator",
    subtitle: "AI로 만드는 전문 교육 영상 콘텐츠",
    description: "AI 영상 생성 도구를 활용하여 교육용 영상, 홍보 영상, SNS 콘텐츠를 제작하는 실무 교육입니다.",
    target_audience: "교육 담당자, 콘텐츠 크리에이터, 마케터", duration: "4시간 (반일)",
    features: ["AI 영상 생성 도구 활용", "교육용 영상 시나리오 작성", "SNS 콘텐츠 제작 실습", "영상 편집 자동화"],
    curriculum: [
      { module: "M1", title: "AI 영상 도구 이해", topics: ["주요 AI 영상 도구 비교", "활용 사례 분석"], hours: "1H" },
      { module: "M2", title: "영상 기획과 제작", topics: ["시나리오 작성", "AI 영상 생성 실습", "편집과 후처리"], hours: "2H" },
      { module: "M3", title: "콘텐츠 배포 전략", topics: ["플랫폼별 최적화", "성과 측정 방법"], hours: "1H" },
    ],
    learning_outcomes: ["AI 도구로 영상 콘텐츠 독립 제작 가능", "교육용 영상 기획 역량", "SNS 콘텐츠 제작 및 배포 역량"],
    methodology: "이론 20% + 실습 70% + 피드백 10%", is_featured: false, sort_order: 3,
  },
  {
    category_id: CAT.ai, program_type: "education", title: "에듀테크 활용 교수법", slug: "edutech-teaching",
    subtitle: "디지털 도구로 혁신하는 교육 방법론",
    description: "최신 에듀테크 도구와 AI를 활용하여 효과적인 교육을 설계하고 운영하는 방법을 배우는 교육자 대상 프로그램입니다.",
    target_audience: "교육기관 교수자, 기업 사내강사", duration: "6시간 (1일)",
    features: ["에듀테크 트렌드 분석", "AI 기반 교육 설계", "온라인 교육 플랫폼 활용", "학습자 참여도 향상 기법"],
    curriculum: [
      { module: "M1", title: "에듀테크 트렌드", topics: ["글로벌 에듀테크 동향", "AI 교육 도구 소개"], hours: "1.5H" },
      { module: "M2", title: "AI 기반 교육 설계", topics: ["학습 목표 설정", "AI 활용 콘텐츠 개발", "평가 설계"], hours: "2H" },
      { module: "M3", title: "실전 교수법", topics: ["블렌디드 러닝 설계", "참여형 수업 운영", "피드백 시스템 구축"], hours: "2.5H" },
    ],
    learning_outcomes: ["에듀테크 활용 교육 설계 역량", "AI 기반 학습 콘텐츠 개발 능력", "학습자 중심 교수법 역량"],
    methodology: "강의 30% + 워크숍 40% + 실습 30%", is_featured: false, sort_order: 4,
  },

  // 진로·진학 (3개)
  {
    category_id: CAT.career, program_type: "education", title: "AI 기반 진로진단 프로그램", slug: "ai-career-diagnosis",
    subtitle: "AI 분석으로 발견하는 나의 적성과 진로",
    description: "AI 진단 도구를 활용하여 학생의 적성, 흥미, 역량을 분석하고 맞춤형 진로를 설계하는 프로그램입니다.",
    target_audience: "중·고등학생, 대학생", duration: "2시간",
    features: ["AI 기반 적성검사", "빅데이터 직업 트렌드 분석", "개인 맞춤 진로 로드맵", "1:1 진로 상담"],
    curriculum: [
      { module: "M1", title: "나를 알아가기", topics: ["AI 적성검사 실시", "강점과 흥미 분석"], hours: "0.5H" },
      { module: "M2", title: "미래 직업 탐색", topics: ["AI 시대 유망 직업", "빅데이터 트렌드 분석"], hours: "0.5H" },
      { module: "M3", title: "진로 설계", topics: ["개인 진로 로드맵 작성", "실행 계획 수립"], hours: "1H" },
    ],
    learning_outcomes: ["자기 적성과 강점 발견", "미래 직업 트렌드 이해", "구체적인 진로 계획 수립"],
    methodology: "AI 진단 + 강의 + 개별 상담", is_featured: true, sort_order: 1,
  },
  {
    category_id: CAT.career, program_type: "education", title: "대학생 취업역량강화 캠프", slug: "university-career-camp",
    subtitle: "AI 시대 취업 경쟁력을 높이는 실전 프로그램",
    description: "이력서 작성부터 면접 준비까지, AI 도구를 활용한 취업 전 과정을 체험하고 실전 역량을 강화하는 캠프형 프로그램입니다.",
    target_audience: "대학교 3~4학년, 취업준비생", duration: "16시간 (2일)",
    features: ["AI 자기소개서 작성법", "모의면접 및 피드백", "직무역량 분석 및 포트폴리오", "취업 트렌드 특강"],
    curriculum: [
      { module: "Day1-AM", title: "취업 전략 수립", topics: ["취업 시장 분석", "AI 활용 자기분석", "목표 기업 설정"], hours: "4H" },
      { module: "Day1-PM", title: "서류 준비", topics: ["AI 활용 이력서 작성", "자기소개서 전략", "포트폴리오 구성"], hours: "4H" },
      { module: "Day2-AM", title: "면접 준비", topics: ["면접 유형별 전략", "AI 모의면접 실습", "피드백 및 개선"], hours: "4H" },
      { module: "Day2-PM", title: "실전 연습", topics: ["모의면접 실전", "개인 피드백", "취업 로드맵 완성"], hours: "4H" },
    ],
    learning_outcomes: ["AI 활용 취업 서류 작성 능력", "면접 대응 역량 강화", "개인 취업 전략 수립"],
    methodology: "강의 20% + 실습 50% + 모의면접 30%", is_featured: false, sort_order: 2,
  },
  {
    category_id: CAT.career, program_type: "education", title: "자기소개서 AI 작성법", slug: "ai-resume-writing",
    subtitle: "AI와 함께 만드는 합격 자기소개서",
    description: "AI 도구를 활용하여 기업별 맞춤 자기소개서를 작성하고, 효과적인 자기 PR 전략을 수립하는 프로그램입니다.",
    target_audience: "취업준비생, 이직 희망자", duration: "3시간",
    features: ["기업별 맞춤 자소서 전략", "AI 활용 문장 개선", "핵심역량 도출 방법", "합격 자소서 분석"],
    curriculum: [
      { module: "M1", title: "자소서 전략", topics: ["기업 분석 방법", "핵심역량 도출"], hours: "1H" },
      { module: "M2", title: "AI 활용 작성", topics: ["AI 도구로 초안 작성", "문장 개선 및 교정"], hours: "1.5H" },
      { module: "M3", title: "피드백", topics: ["동료 리뷰", "강사 피드백", "최종 완성"], hours: "0.5H" },
    ],
    learning_outcomes: ["AI 활용 자소서 작성 역량", "기업 맞춤형 PR 전략", "자기분석 및 표현 능력"],
    methodology: "강의 20% + 실습 60% + 피드백 20%", is_featured: false, sort_order: 3,
  },

  // 교육컨설팅 (2개)
  {
    category_id: CAT.consulting, program_type: "education", title: "맞춤형 교육과정 설계", slug: "custom-curriculum-design",
    subtitle: "기업 니즈에 최적화된 교육 프로그램 개발",
    description: "기업의 교육 니즈를 분석하고, 조직 목표에 부합하는 맞춤형 교육 커리큘럼을 설계하는 방법론을 학습합니다.",
    target_audience: "기업 HRD 담당자, 교육 기획자", duration: "8시간 (1일)",
    features: ["교육 니즈 분석 프레임워크", "ADDIE 모델 기반 설계", "교육 효과성 측정 방법", "교육 ROI 분석"],
    curriculum: [
      { module: "M1", title: "교육 니즈 분석", topics: ["조직 분석", "직무 분석", "학습자 분석"], hours: "2H" },
      { module: "M2", title: "교육과정 설계", topics: ["학습 목표 설정", "콘텐츠 구성", "교수 전략"], hours: "3H" },
      { module: "M3", title: "실행과 평가", topics: ["교육 운영 계획", "평가 도구 설계", "ROI 측정"], hours: "3H" },
    ],
    learning_outcomes: ["체계적인 교육 니즈 분석 역량", "ADDIE 기반 교육 설계 능력", "교육 ROI 측정 및 보고 역량"],
    methodology: "강의 30% + 워크숍 50% + 사례연구 20%", is_featured: false, sort_order: 1,
  },
  {
    category_id: CAT.consulting, program_type: "education", title: "교육 성과분석 및 ROI 측정", slug: "education-roi",
    subtitle: "교육 투자 효과를 데이터로 증명하는 방법",
    description: "교육 프로그램의 성과를 체계적으로 측정하고, 경영진에게 교육의 ROI를 효과적으로 보고하는 역량을 개발합니다.",
    target_audience: "교육 담당 관리자, HRD 실무자", duration: "4시간 (반일)",
    features: ["Kirkpatrick 4단계 평가모델", "교육 ROI 산출 방법론", "데이터 기반 보고서 작성", "경영진 보고 스킬"],
    curriculum: [
      { module: "M1", title: "교육 평가 이론", topics: ["Kirkpatrick 모델", "Phillips ROI 모델"], hours: "1.5H" },
      { module: "M2", title: "실무 적용", topics: ["평가 도구 설계", "데이터 수집과 분석", "ROI 산출 실습"], hours: "2H" },
      { module: "M3", title: "보고와 활용", topics: ["보고서 작성", "경영진 프레젠테이션"], hours: "0.5H" },
    ],
    learning_outcomes: ["교육 효과 측정 체계 구축", "ROI 기반 교육 예산 정당화", "데이터 기반 의사결정 역량"],
    methodology: "이론 30% + 사례분석 40% + 실습 30%", is_featured: false, sort_order: 2,
  },

  // 리더십·조직교육 (4개)
  {
    category_id: CAT.leadership, program_type: "education", title: "조직활성화 워크숍", slug: "team-activation-workshop",
    subtitle: "소통과 협업으로 하나되는 조직 만들기",
    description: "조직 구성원들의 소통과 협업을 강화하여 팀워크를 증진하고, 긍정적인 조직문화를 형성하는 체험형 워크숍입니다.",
    target_audience: "기업 전 직원, 팀 단위", duration: "4~8시간",
    features: ["팀빌딩 액티비티", "소통 게임 및 실습", "조직문화 진단", "비전 공유 워크숍"],
    curriculum: [
      { module: "M1", title: "아이스브레이킹", topics: ["팀 구성 및 소개", "소통 게임"], hours: "1H" },
      { module: "M2", title: "팀워크 활동", topics: ["협업 미션 수행", "역할 분담 실습", "문제해결 챌린지"], hours: "2H" },
      { module: "M3", title: "소통과 공감", topics: ["커뮤니케이션 스킬", "경청과 피드백", "갈등 해결"], hours: "2H" },
      { module: "M4", title: "비전 공유", topics: ["조직 비전 워크숍", "팀 다짐 및 발표"], hours: "1H" },
    ],
    learning_outcomes: ["팀 내 소통과 협업 역량 강화", "긍정적 조직문화 형성", "구성원 간 신뢰와 유대감 강화"],
    methodology: "체험학습 60% + 토론 20% + 실습 20%", is_featured: true, sort_order: 1,
  },
  {
    category_id: CAT.leadership, program_type: "education", title: "소통 리더십", slug: "communication-leadership",
    subtitle: "구성원의 마음을 여는 리더의 소통법",
    description: "효과적인 소통을 통해 팀의 동기를 부여하고, 성과를 이끌어내는 리더십 역량을 개발하는 프로그램입니다.",
    target_audience: "팀장, 중간관리자", duration: "4시간 (반일)",
    features: ["리더십 소통 유형 진단", "경청과 피드백 스킬", "세대간 소통 방법론", "코칭형 대화법"],
    curriculum: [
      { module: "M1", title: "리더의 소통", topics: ["소통 유형 진단", "리더의 역할 변화"], hours: "1H" },
      { module: "M2", title: "소통 스킬", topics: ["적극적 경청", "효과적 피드백", "갈등 관리"], hours: "2H" },
      { module: "M3", title: "실전 적용", topics: ["1:1 면담 롤플레이", "팀 미팅 운영법"], hours: "1H" },
    ],
    learning_outcomes: ["리더십 소통 역량 강화", "구성원 동기부여 능력", "갈등 관리 및 해결 능력"],
    methodology: "강의 20% + 롤플레이 40% + 토론 40%", is_featured: false, sort_order: 2,
  },
  {
    category_id: CAT.leadership, program_type: "education", title: "코칭 리더십", slug: "coaching-leadership",
    subtitle: "질문과 경청으로 이끄는 성장형 리더십",
    description: "코칭 방법론을 활용하여 구성원의 자발적 성장을 이끌고, 팀 전체의 역량을 끌어올리는 리더십 프로그램입니다.",
    target_audience: "팀장, 임원, 관리자", duration: "8시간 (1일)",
    features: ["코칭 마인드셋", "GROW 모델 실습", "질문 기법", "코칭 대화 실전"],
    curriculum: [
      { module: "M1", title: "코칭의 이해", topics: ["코칭 vs 티칭", "코칭 마인드셋", "GROW 모델"], hours: "2H" },
      { module: "M2", title: "코칭 스킬", topics: ["강력한 질문법", "적극적 경청", "인정과 칭찬"], hours: "3H" },
      { module: "M3", title: "실전 코칭", topics: ["1:1 코칭 실습", "상황별 코칭 시나리오", "개인 코칭 플랜"], hours: "3H" },
    ],
    learning_outcomes: ["코칭 기반 리더십 역량", "구성원 성장 지원 능력", "자기 주도적 팀 문화 조성"],
    methodology: "이론 20% + 실습 50% + 롤플레이 30%", is_featured: false, sort_order: 3,
  },
  {
    category_id: CAT.leadership, program_type: "education", title: "MZ세대 이해와 소통", slug: "mz-generation-communication",
    subtitle: "세대 차이를 넘어 함께 성장하는 조직",
    description: "MZ세대의 가치관과 업무 스타일을 이해하고, 세대 간 효과적인 소통과 협업 방법을 학습하는 프로그램입니다.",
    target_audience: "관리자, 팀장, HR 담당자", duration: "3시간",
    features: ["MZ세대 특성 분석", "세대간 갈등 사례연구", "소통 전략 수립", "동기부여 방법론"],
    curriculum: [
      { module: "M1", title: "세대 이해", topics: ["MZ세대의 가치관", "업무 스타일 차이", "갈등 원인 분석"], hours: "1H" },
      { module: "M2", title: "소통 전략", topics: ["세대별 소통법", "피드백 방법", "동기부여 전략"], hours: "1.5H" },
      { module: "M3", title: "실전 적용", topics: ["사례 토론", "소통 플랜 수립"], hours: "0.5H" },
    ],
    learning_outcomes: ["세대 특성 이해 및 공감 능력", "효과적인 세대간 소통 역량", "MZ세대 맞춤 동기부여 전략"],
    methodology: "강의 30% + 사례토론 40% + 워크숍 30%", is_featured: false, sort_order: 4,
  },

  // 직무역량 강화 (3개)
  {
    category_id: CAT.competency, program_type: "education", title: "비즈니스 커뮤니케이션", slug: "business-communication",
    subtitle: "성과를 만드는 직장인의 소통 기술",
    description: "직장 내 다양한 상황에서 효과적으로 소통하고, 설득력 있는 의사전달 능력을 키우는 실무 교육입니다.",
    target_audience: "기업 임직원 전체", duration: "4시간 (반일)",
    features: ["커뮤니케이션 유형 진단", "설득과 협상 스킬", "이메일/보고 커뮤니케이션", "회의 운영법"],
    curriculum: [
      { module: "M1", title: "소통의 기본", topics: ["커뮤니케이션 유형 진단", "효과적 전달 기법"], hours: "1.5H" },
      { module: "M2", title: "실무 소통", topics: ["보고와 설득", "이메일 작성법", "회의 운영"], hours: "2H" },
      { module: "M3", title: "갈등과 협상", topics: ["갈등 상황 대처", "WIN-WIN 협상"], hours: "0.5H" },
    ],
    learning_outcomes: ["직장 내 소통 역량 강화", "설득력 있는 보고 능력", "효율적 회의 운영 역량"],
    methodology: "이론 20% + 롤플레이 50% + 실습 30%", is_featured: false, sort_order: 1,
  },
  {
    category_id: CAT.competency, program_type: "education", title: "문제해결 방법론", slug: "problem-solving",
    subtitle: "논리적 사고로 해결하는 비즈니스 문제",
    description: "체계적인 문제 분석 프레임워크를 학습하고, 논리적 사고를 기반으로 비즈니스 문제를 해결하는 역량을 개발합니다.",
    target_audience: "기업 실무자, 관리자", duration: "6시간 (1일)",
    features: ["문제 정의 프레임워크", "로직트리 분석", "가설 기반 접근법", "데이터 기반 의사결정"],
    curriculum: [
      { module: "M1", title: "문제 정의", topics: ["문제 vs 현상 구분", "이슈트리 작성", "우선순위 설정"], hours: "2H" },
      { module: "M2", title: "분석과 해결", topics: ["로직트리 분석", "가설 수립과 검증", "대안 평가"], hours: "2.5H" },
      { module: "M3", title: "실전 프로젝트", topics: ["기업 사례 분석", "팀 프로젝트", "발표 및 피드백"], hours: "1.5H" },
    ],
    learning_outcomes: ["체계적 문제 분석 역량", "논리적 사고와 의사결정 능력", "데이터 기반 해결책 도출 역량"],
    methodology: "이론 25% + 사례분석 35% + 프로젝트 40%", is_featured: false, sort_order: 2,
  },
  {
    category_id: CAT.competency, program_type: "education", title: "스마트워크 & 업무 생산성", slug: "smart-work",
    subtitle: "디지털 도구로 일하는 방식을 혁신하다",
    description: "최신 협업 도구와 업무 관리 방법론을 활용하여 개인과 팀의 업무 생산성을 극대화하는 교육입니다.",
    target_audience: "기업 전 직원", duration: "3시간",
    features: ["업무 관리 도구 활용", "협업 플랫폼 실습", "시간 관리 방법론", "디지털 워크플로우"],
    curriculum: [
      { module: "M1", title: "스마트워크 개요", topics: ["일하는 방식의 변화", "디지털 도구 소개"], hours: "1H" },
      { module: "M2", title: "도구 활용 실습", topics: ["노션/슬랙 활용법", "프로젝트 관리 도구", "자동화 워크플로우"], hours: "1.5H" },
      { module: "M3", title: "업무 습관 개선", topics: ["시간 관리 기법", "우선순위 설정"], hours: "0.5H" },
    ],
    learning_outcomes: ["디지털 협업 도구 활용 역량", "업무 효율성 향상", "시간 관리 및 우선순위 설정 능력"],
    methodology: "이론 20% + 실습 60% + 토론 20%", is_featured: false, sort_order: 3,
  },

  // 법정의무교육 (3개)
  {
    category_id: CAT.mandatory, program_type: "education", title: "직장 내 성희롱 예방교육", slug: "harassment-prevention",
    subtitle: "건전한 직장문화를 위한 필수 교육",
    description: "남녀고용평등법에 따른 성희롱 예방교육으로, 직장 내 성희롱의 개념과 유형, 예방 및 대처 방법을 학습합니다.",
    target_audience: "전 직원 (연 1회 의무)", duration: "1시간",
    features: ["성희롱 개념과 유형", "법적 책임과 처벌", "사례 중심 학습", "피해자 보호 절차"],
    curriculum: [
      { module: "M1", title: "성희롱의 이해", topics: ["성희롱 개념과 유형", "관련 법률"], hours: "20분" },
      { module: "M2", title: "사례와 판례", topics: ["실제 사례 분석", "판례 소개"], hours: "20분" },
      { module: "M3", title: "예방과 대처", topics: ["예방 행동수칙", "피해자 보호", "신고 절차"], hours: "20분" },
    ],
    learning_outcomes: ["성희롱 개념과 유형 이해", "예방 행동수칙 습득", "피해 발생 시 대처 방법 숙지"],
    methodology: "강의 50% + 사례분석 30% + Q&A 20%", is_featured: false, sort_order: 1,
  },
  {
    category_id: CAT.mandatory, program_type: "education", title: "개인정보보호 교육", slug: "privacy-protection-edu",
    subtitle: "개인정보 유출 방지를 위한 실무 교육",
    description: "개인정보보호법에 따른 의무 교육으로, 개인정보의 수집·이용·관리 절차와 유출 방지 방법을 학습합니다.",
    target_audience: "전 직원 (연 1회 의무)", duration: "1시간",
    features: ["개인정보보호법 이해", "수집/이용/제공 원칙", "유출 사고 대응", "실무 점검 체크리스트"],
    curriculum: [
      { module: "M1", title: "법률 이해", topics: ["개인정보보호법 개요", "주요 조항 해설"], hours: "20분" },
      { module: "M2", title: "실무 관리", topics: ["수집/이용 절차", "안전 관리 조치", "유출 사고 대응"], hours: "25분" },
      { module: "M3", title: "점검과 실습", topics: ["자가점검 체크리스트", "사례 퀴즈"], hours: "15분" },
    ],
    learning_outcomes: ["개인정보보호 관련 법률 이해", "업무 중 개인정보 관리 역량", "유출 사고 예방 및 대응 능력"],
    methodology: "강의 40% + 사례분석 30% + 퀴즈 30%", is_featured: false, sort_order: 2,
  },
  {
    category_id: CAT.mandatory, program_type: "education", title: "직장 내 괴롭힘 예방교육", slug: "workplace-bullying-prevention",
    subtitle: "존중과 배려의 직장문화 만들기",
    description: "근로기준법에 따른 직장 내 괴롭힘 예방교육으로, 괴롭힘의 유형과 판단기준, 예방 및 대처 방법을 학습합니다.",
    target_audience: "전 직원 (연 1회 의무)", duration: "1시간",
    features: ["괴롭힘 개념과 유형", "법적 판단기준", "사례 중심 학습", "조직문화 개선 방안"],
    curriculum: [
      { module: "M1", title: "괴롭힘의 이해", topics: ["개념과 유형", "법적 판단기준"], hours: "20분" },
      { module: "M2", title: "사례 분석", topics: ["실제 사례", "판례 분석"], hours: "20분" },
      { module: "M3", title: "예방과 문화", topics: ["예방 행동수칙", "건전한 조직문화", "신고 절차"], hours: "20분" },
    ],
    learning_outcomes: ["직장 내 괴롭힘 유형 인지", "예방 행동수칙 습득", "건전한 직장문화 조성 인식"],
    methodology: "강의 40% + 사례분석 40% + 토론 20%", is_featured: false, sort_order: 3,
  },
];

async function seed() {
  const { data, error } = await supabase
    .from("programs")
    .insert(programs.map((p) => ({ ...p, status: "published" })))
    .select("id, title");

  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Inserted", data.length, "programs:");
    data.forEach((d) => console.log(" -", d.title));
  }
}

seed().catch(console.error);
