import type { Post, Schedule } from "@/types";

// 목업 공지사항
export const mockNotices: Post[] = [
  { id: "n1", board_type: "notice", title: "2026년 제1기 AI교육전문가 자격과정 모집 안내", content: "한국교육컨설팅협회(KECA)에서 2026년 제1기 인공지능(AI)교육전문가 자격과정 수강생을 모집합니다.\n\n■ 모집 기간: 2026년 3월 25일 ~ 4월 10일\n■ 교육 기간: 2026년 4월 20일 ~ 6월 15일 (매주 토요일)\n■ 교육 장소: 서울 강남 KECA 교육센터\n■ 모집 인원: 30명 (선착순)\n■ 수강료: 500,000원 (KECA 회원 20% 할인)\n\n자격과정 수료 후 인공지능(AI)교육전문가 자격시험 응시 자격이 부여됩니다.\n\n문의: info@keca.or.kr", is_pinned: true, view_count: 342, status: "published", created_at: "2026-03-25", updated_at: "2026-03-25" },
  { id: "n2", board_type: "notice", title: "KECA 연간 교육일정 안내", content: "2026년 KECA 연간 교육일정을 안내드립니다.\n\n상세 일정은 교육일정 페이지에서 확인하실 수 있습니다.", is_pinned: false, view_count: 215, status: "published", created_at: "2026-03-20", updated_at: "2026-03-20" },
  { id: "n3", board_type: "notice", title: "제3회 교육컨설팅 세미나 개최 안내", content: "KECA 주최 제3회 교육컨설팅 세미나를 개최합니다.\n\n■ 일시: 2026년 4월 15일(수) 14:00~17:00\n■ 장소: 서울 코엑스 컨퍼런스룸\n■ 주제: AI 시대의 교육컨설팅 전략\n■ 참가비: 무료 (KECA 회원), 30,000원 (비회원)", is_pinned: false, view_count: 178, status: "published", created_at: "2026-03-15", updated_at: "2026-03-15" },
  { id: "n4", board_type: "notice", title: "신규 회원 가입 혜택 안내", content: "KECA 신규 회원 가입 시 다양한 혜택을 제공합니다.", is_pinned: false, view_count: 156, status: "published", created_at: "2026-03-10", updated_at: "2026-03-10" },
  { id: "n5", board_type: "notice", title: "2026년 상반기 보수교육 일정 공지", content: "자격 유지를 위한 보수교육 일정을 안내드립니다.", is_pinned: false, view_count: 98, status: "published", created_at: "2026-03-05", updated_at: "2026-03-05" },
];

// 목업 교육후기
export const mockReviews: Post[] = [
  { id: "r1", board_type: "review", title: "AI 교육 덕분에 업무 효율이 크게 올랐습니다", content: "생성형 AI 활용 교육을 수강한 후 보고서 작성 시간이 절반으로 줄었습니다. 특히 프롬프트 엔지니어링 파트가 실무에 바로 적용할 수 있어서 좋았습니다. 강사님의 실습 위주 강의가 정말 도움이 되었습니다.", view_count: 89, status: "published", created_at: "2026-03-22", updated_at: "2026-03-22", author_id: "mock-user-1" },
  { id: "r2", board_type: "review", title: "체계적인 커리큘럼이 인상적이었습니다", content: "교육컨설팅 과정을 수강했는데, 이론과 실습이 균형 있게 구성되어 있어 매우 만족스러웠습니다. 다음 과정도 꼭 수강하고 싶습니다.", view_count: 67, status: "published", created_at: "2026-03-18", updated_at: "2026-03-18", author_id: "mock-user-2" },
  { id: "r3", board_type: "review", title: "강사님의 실무 경험이 많은 도움이 되었습니다", content: "리더십 워크숍에 참여했습니다. 강사님의 풍부한 실무 경험을 바탕으로 한 사례 중심 교육이 매우 유익했습니다.", view_count: 54, status: "published", created_at: "2026-03-12", updated_at: "2026-03-12", author_id: "mock-user-3" },
];

// 목업 교육사진
export const mockGalleryPosts: Post[] = [
  { id: "g1", board_type: "photo_gallery", title: "제1기 AI교육전문가 과정 수료식", content: "2025년 12월 제1기 AI교육전문가 과정 수료식이 성공적으로 진행되었습니다.", view_count: 203, status: "published", created_at: "2025-12-20", updated_at: "2025-12-20" },
  { id: "g2", board_type: "photo_gallery", title: "2026년 신년 교육컨설팅 세미나", content: "2026년 첫 교육컨설팅 세미나 현장입니다.", view_count: 145, status: "published", created_at: "2026-01-15", updated_at: "2026-01-15" },
  { id: "g3", board_type: "photo_gallery", title: "AI 활용 교육 실습 현장", content: "기업 대상 AI 활용 교육 실습 현장 모습입니다.", view_count: 112, status: "published", created_at: "2026-02-28", updated_at: "2026-02-28" },
];

// 목업 영상
export const mockVideoPosts: Post[] = [
  { id: "v1", board_type: "video_gallery", title: "KECA 소개 영상", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", view_count: 520, status: "published", created_at: "2026-01-10", updated_at: "2026-01-10" },
  { id: "v2", board_type: "video_gallery", title: "생성형 AI 교육 하이라이트", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", view_count: 380, status: "published", created_at: "2026-02-15", updated_at: "2026-02-15" },
  { id: "v3", board_type: "video_gallery", title: "AI교육전문가 자격과정 안내", video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", view_count: 290, status: "published", created_at: "2026-03-01", updated_at: "2026-03-01" },
];

// 목업 자료실
export const mockResources: Post[] = [
  { id: "d1", board_type: "resource", title: "2026년 KECA 교육 카탈로그", file_url: "#", view_count: 156, status: "published", created_at: "2026-03-01", updated_at: "2026-03-01" },
  { id: "d2", board_type: "resource", title: "AI교육전문가 자격시험 안내서", file_url: "#", view_count: 234, status: "published", created_at: "2026-02-15", updated_at: "2026-02-15" },
  { id: "d3", board_type: "resource", title: "교육컨설팅 표준 매뉴얼 (요약본)", file_url: "#", view_count: 189, status: "published", created_at: "2026-01-20", updated_at: "2026-01-20" },
];

// 목업 교육일정
export const mockSchedules: Schedule[] = [
  { id: "s1", title: "AI교육전문가 1급 과정", start_date: "2026-04-05", end_date: "2026-04-05", start_time: "09:00", end_time: "18:00", location: "서울 강남 KECA 교육센터", is_online: false, status: "scheduled", created_at: "" },
  { id: "s2", title: "교육컨설팅 기초 세미나", start_date: "2026-04-12", start_time: "14:00", end_time: "17:00", is_online: true, status: "scheduled", created_at: "" },
  { id: "s3", title: "리더십 워크숍", start_date: "2026-04-20", start_time: "09:00", end_time: "13:00", location: "서울 강남", is_online: false, status: "scheduled", created_at: "" },
  { id: "s4", title: "생성형 AI 활용 교육", start_date: "2026-04-25", end_date: "2026-04-26", start_time: "09:00", end_time: "18:00", location: "서울 코엑스", is_online: false, status: "scheduled", created_at: "" },
  { id: "s5", title: "진로교육 강사양성 과정", start_date: "2026-05-10", start_time: "09:00", end_time: "18:00", location: "서울 강남", is_online: false, status: "scheduled", created_at: "" },
  { id: "s6", title: "보수교육 (온라인)", start_date: "2026-05-15", start_time: "10:00", end_time: "16:00", is_online: true, status: "scheduled", created_at: "" },
];

// 전체 게시글 조회 헬퍼
export function getAllPosts() {
  return [...mockNotices, ...mockReviews, ...mockGalleryPosts, ...mockVideoPosts, ...mockResources];
}

export function getPostById(id: string) {
  return getAllPosts().find((p) => p.id === id);
}

export function getPostsByBoard(boardType: string) {
  return getAllPosts().filter((p) => p.board_type === boardType && p.status === "published");
}
