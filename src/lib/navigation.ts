import type { MenuItem } from "@/types";

export const mainNavigation: MenuItem[] = [
  {
    label: "협회소개",
    href: "/about",
    children: [
      { label: "인사말", href: "/about" },
      { label: "비전/미션", href: "/about/vision" },
      { label: "조직현황", href: "/about/organization" },
      { label: "연혁", href: "/about/history" },
      { label: "대표실적", href: "/about/achievements" },
      { label: "오시는길", href: "/about/location" },
      { label: "회원혜택", href: "/about/benefits" },
    ],
  },
  {
    label: "교육프로그램",
    href: "/programs",
    children: [
      { label: "AI·에듀테크 교육", href: "/programs?category=ai-edutech", icon: "cpu" },
      { label: "진로·진학 컨설팅", href: "/programs?category=career", icon: "compass" },
      { label: "교육컨설팅", href: "/programs?category=consulting", icon: "briefcase" },
      { label: "리더십·조직교육", href: "/programs?category=leadership", icon: "users" },
      { label: "직무역량 강화", href: "/programs?category=competency", icon: "target" },
      { label: "법정의무교육", href: "/programs?category=mandatory", icon: "shield" },
    ],
  },
  {
    label: "전문가과정",
    href: "/expert",
    children: [
      { label: "자격증 과정", href: "/expert?type=certification" },
      { label: "강사양성 과정", href: "/expert?type=instructor" },
      { label: "보수교육", href: "/expert?type=continuing" },
    ],
  },
  {
    label: "자격소개",
    href: "/certification",
    children: [
      { label: "인공지능(AI)교육전문가", href: "/certification" },
      { label: "검정기준 및 과목", href: "/certification/standards" },
      { label: "자격증 신청안내", href: "/certification/apply" },
      { label: "배출현황", href: "/certification/graduates" },
      { label: "온라인 자격시험", href: "/certification/online-exam" },
    ],
  },
  {
    label: "강사진",
    href: "/instructors",
  },
  {
    label: "강의공고",
    href: "/lectures",
  },
  {
    label: "커뮤니티",
    href: "/community/notice",
    children: [
      { label: "공지사항", href: "/community/notice" },
      { label: "교육일정", href: "/community/schedule" },
      { label: "강의공고", href: "/lectures" },
      { label: "교육후기", href: "/community/review" },
      { label: "교육사진 갤러리", href: "/community/gallery" },
      { label: "영상갤러리", href: "/community/videos" },
      { label: "자료실", href: "/community/resources" },
    ],
  },
  {
    label: "교육문의",
    href: "/inquiry",
  },
];
