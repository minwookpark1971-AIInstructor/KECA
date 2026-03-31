import { getLectures } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/queries";
import Link from "next/link";
import type { Lecture } from "@/types";

export const metadata = {
  title: "강의공고",
  description: "KECA 강의공고 목록입니다. 정회원이라면 강사로 지원하실 수 있습니다.",
};

function StatusBadge({ status }: { status: Lecture["status"] }) {
  const map = {
    open: { label: "모집중", className: "bg-green-100 text-green-700" },
    closed: { label: "마감", className: "bg-gray-100 text-gray-500" },
    completed: { label: "완료", className: "bg-blue-100 text-blue-600" },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export default async function LecturesPage() {
  const [lectures, user] = await Promise.all([getLectures(), getCurrentUser()]);

  const isMember = user && (user.role === "member" || user.role === "admin" || user.role === "instructor");

  return (
    <div className="min-h-screen bg-surface">
      {/* 헤더 */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-sm text-primary font-medium mb-2">LECTURE POSTING</p>
          <h1 className="text-3xl font-bold text-text">강의공고</h1>
          <p className="mt-2 text-text-sub">
            KECA에서 강사를 모집하는 강의공고입니다. 정회원이라면 지원하실 수 있습니다.
          </p>
          {!user && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg text-sm text-primary">
              강사 지원은 <Link href="/login" className="font-semibold underline">로그인</Link> 후 정회원만 가능합니다.
            </div>
          )}
          {user && !isMember && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
              강사 지원은 정회원 전용입니다.{" "}
              <Link href="/mypage/membership" className="font-semibold underline">회원 가입 안내 보기</Link>
            </div>
          )}
        </div>
      </div>

      {/* 목록 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {lectures.length === 0 ? (
          <div className="text-center py-20 text-text-sub">
            현재 모집 중인 강의공고가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture) => (
              <Link
                key={lecture.id}
                href={`/lectures/${lecture.id}`}
                className="bg-white rounded-xl border border-border-light p-6 hover:shadow-md transition-shadow flex flex-col gap-3 min-w-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-text leading-snug flex-1 break-keep">
                    {lecture.title}
                  </h2>
                  <StatusBadge status={lecture.status} />
                </div>

                <div className="space-y-1.5 text-sm text-text-sub">
                  {lecture.lecture_date && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-text-sub/60 w-16 shrink-0 pt-0.5">강의일</span>
                      <span>{lecture.lecture_date}</span>
                      {lecture.lecture_time && <span>{lecture.lecture_time}</span>}
                    </div>
                  )}
                  {lecture.location && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-text-sub/60 w-16 shrink-0 pt-0.5">장소</span>
                      <span>{lecture.location}</span>
                    </div>
                  )}
                  {lecture.fee && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-text-sub/60 w-16 shrink-0 pt-0.5">강사료</span>
                      <span className="font-medium text-text break-keep">{lecture.fee}</span>
                    </div>
                  )}
                  {lecture.deadline && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-text-sub/60 w-16 shrink-0 pt-0.5">마감일</span>
                      <span className="text-red-500 font-medium">{lecture.deadline}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-border-light flex items-center justify-between">
                  <span className="text-xs text-text-sub">
                    필요 강사 {lecture.required_count}명
                    {lecture.max_applicants ? ` (최대 ${lecture.max_applicants}명 선발)` : ""}
                  </span>
                  <span className={`text-xs font-medium ${lecture.status === "open" ? "text-primary" : "text-text-sub"}`}>
                    {lecture.status === "open" ? "지원하기 →" : "상세보기 →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
