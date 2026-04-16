import Link from "next/link";

export default function ApplyNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">유효하지 않은 링크입니다</h1>
        <p className="text-sm text-text-sub">
          요청하신 신청 링크를 찾을 수 없습니다. 링크가 만료되었거나 잘못 입력되었을 수 있습니다.
        </p>
        <p className="text-xs text-text-muted">
          담당자에게 문의하시거나 KECA 홈페이지에서 다시 확인해주세요.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          홈으로 이동
        </Link>
      </div>
    </div>
  );
}
