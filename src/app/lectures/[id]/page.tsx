import { getLectureById, getCurrentUser, getApplicationsByUser } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import ApplyModal from "./ApplyModal";
import LectureCancelButton from "./LectureCancelButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lecture = await getLectureById(id);
  return { title: lecture?.title ?? "강의공고" };
}

export default async function LectureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lecture, user] = await Promise.all([getLectureById(id), getCurrentUser()]);

  if (!lecture) notFound();

  const isMember = user && (user.role === "member" || user.role === "instructor");

  // 이미 지원했는지 확인
  let existingApplication = null;
  if (user) {
    try {
      const apps = await getApplicationsByUser(user.id);
      existingApplication = apps.find((a) => a.lecture_id === lecture.id) ?? null;
    } catch {
      // applications 테이블 접근 실패 시 무시 (RLS 등)
    }
  }

  const isOpen = lecture.status === "open";
  const deadlinePassed = lecture.deadline
    ? new Date(lecture.deadline) < new Date()
    : false;
  const canApply = isOpen && !deadlinePassed && isMember && !existingApplication;

  const statusMap = {
    open: { label: "모집중", cls: "bg-green-100 text-green-700" },
    closed: { label: "마감", cls: "bg-gray-100 text-gray-500" },
    completed: { label: "완료", cls: "bg-blue-100 text-blue-600" },
  };
  const statusInfo = statusMap[lecture.status];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* 헤더 */}
        <div className="bg-white rounded-xl border border-border-light p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold text-text leading-snug flex-1">{lecture.title}</h1>
            <span className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
          </div>

          {lecture.description && (
            <p className="text-text-sub leading-relaxed whitespace-pre-wrap mb-6">{lecture.description}</p>
          )}

          {/* 상세 정보 */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {lecture.lecture_date && (
              <>
                <div className="flex gap-3">
                  <dt className="text-text-sub/60 w-20 shrink-0">강의 일자</dt>
                  <dd className="text-text font-medium">
                    {lecture.lecture_date}
                    {lecture.lecture_time && ` ${lecture.lecture_time}`}
                  </dd>
                </div>
              </>
            )}
            {lecture.duration && (
              <div className="flex gap-3">
                <dt className="text-text-sub/60 w-20 shrink-0">소요 시간</dt>
                <dd className="text-text font-medium">{lecture.duration}</dd>
              </div>
            )}
            {lecture.location && (
              <div className="flex gap-3">
                <dt className="text-text-sub/60 w-20 shrink-0">장소</dt>
                <dd className="text-text font-medium">{lecture.location}</dd>
              </div>
            )}
            {lecture.target && (
              <div className="flex gap-3">
                <dt className="text-text-sub/60 w-20 shrink-0">교육 대상</dt>
                <dd className="text-text font-medium">{lecture.target}</dd>
              </div>
            )}
            {lecture.fee && (
              <div className="flex gap-3">
                <dt className="text-text-sub/60 w-20 shrink-0">강사료</dt>
                <dd className="text-primary font-semibold">{lecture.fee}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="text-text-sub/60 w-20 shrink-0">모집 인원</dt>
              <dd className="text-text font-medium">
                {lecture.required_count}명
                {lecture.max_applicants
                  ? ` (1.5배수 ${lecture.max_applicants}명 접수)`
                  : ""}
              </dd>
            </div>
            {lecture.deadline && (
              <div className="flex gap-3">
                <dt className="text-text-sub/60 w-20 shrink-0">지원 마감</dt>
                <dd className={`font-medium ${deadlinePassed ? "text-gray-400 line-through" : "text-red-500"}`}>
                  {lecture.deadline}
                  {deadlinePassed && " (마감됨)"}
                </dd>
              </div>
            )}
          </dl>

          {lecture.requirements && (
            <div className="mt-6 pt-6 border-t border-border-light">
              <h3 className="text-sm font-semibold text-text mb-2">지원 자격 요건</h3>
              <p className="text-sm text-text-sub leading-relaxed whitespace-pre-wrap">
                {lecture.requirements}
              </p>
            </div>
          )}
        </div>

        {/* 지원 영역 */}
        <div className="bg-white rounded-xl border border-border-light p-6 sm:p-8">
          {existingApplication ? (
            <div className="text-center">
              <p className="text-sm text-text-sub mb-1">지원 완료</p>
              <p className="font-medium text-text">
                현재 지원 상태:{" "}
                {{
                  pending: "접수 대기",
                  deposit_pending: "보증금 결제 대기",
                  submitted: "접수 완료",
                  reviewing: "심사중",
                  selected: "강사확정 (보증금 결제 필요)",
                  confirmed: "최종확정",
                  standby: "예비강사",
                  rejected: "미선발",
                  cancelled: "취소",
                }[existingApplication.status] ?? existingApplication.status}
              </p>
              {existingApplication.status === "pending" && (
                <div className="mt-3">
                  <p className="text-sm text-amber-600 mb-2">서류 제출이 필요합니다.</p>
                  <a href={`/mypage/applications/${existingApplication.id}`} className="text-sm text-primary font-medium hover:underline">
                    서류 제출하러 가기 →
                  </a>
                </div>
              )}
              {["pending", "submitted", "reviewing"].includes(existingApplication.status) && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <a href={`/mypage/applications/${existingApplication.id}`} className="text-xs text-text-muted hover:text-primary">
                    지원 상세 보기
                  </a>
                  <LectureCancelButton applicationId={existingApplication.id} userId={user!.id} />
                </div>
              )}
            </div>
          ) : !user ? (
            <div className="text-center">
              <p className="text-text-sub mb-4">강사 지원은 로그인 후 이용하실 수 있습니다.</p>
              <a
                href={`/login?redirect=/lectures/${lecture.id}`}
                className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                로그인하기
              </a>
            </div>
          ) : !isMember ? (
            <div className="text-center">
              <p className="text-text-sub mb-1">강사 지원은 정회원 전용 기능입니다.</p>
              <p className="text-sm text-text-sub mb-4">정회원 가입 후 지원하실 수 있습니다.</p>
              <a
                href="/mypage/membership"
                className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                정회원 가입 안내
              </a>
            </div>
          ) : !isOpen || deadlinePassed ? (
            <div className="text-center text-text-sub">
              {deadlinePassed ? "지원 마감된 공고입니다." : "모집이 종료된 공고입니다."}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-text-sub mb-1">지원 보증금: <strong className="text-text">30,000원</strong></p>
              <p className="text-xs text-text-sub mb-4">미선발 시 100% 환불됩니다.</p>
              <ApplyModal lecture={lecture} user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
