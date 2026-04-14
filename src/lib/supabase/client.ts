import { createBrowserClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const parsed = parse(document.cookie);
          return Object.keys(parsed).map((name) => ({
            name,
            value: parsed[name] ?? "",
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // @supabase/ssr 라이브러리가 maxAge를 항상 400일로 강제 설정하므로,
            // 커스텀 핸들러에서 maxAge/expires를 제거하여 세션 쿠키로 변환.
            // 브라우저 종료 시 세션 쿠키가 자동 삭제되어 로그아웃됨.
            //
            // 단, maxAge=0은 쿠키 삭제(로그아웃) 동작이므로 유지.
            const sessionOptions = { ...options };
            if (sessionOptions.maxAge && sessionOptions.maxAge > 0) {
              delete sessionOptions.maxAge;
            }
            delete sessionOptions.expires;
            document.cookie = serialize(name, value, sessionOptions);
          });
        },
      },
    }
  );
}
