// 보호 라우트 그룹 레이아웃
// 현재는 목업 모드이므로 그대로 통과. Supabase 연동 시 세션 체크 추가.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
