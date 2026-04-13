import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 보호 경로 패턴
const protectedPaths = ["/mypage", "/instructor", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 자원은 스킵
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // .ico, .png, .css 등
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // maxAge/expires 제거 → 세션 쿠키 (브라우저 종료 시 자동 삭제)
            const sessionOptions = { ...options };
            delete sessionOptions.maxAge;
            delete sessionOptions.expires;

            request.cookies.set(name, value);
            response.cookies.set(name, value, sessionOptions);
          });
        },
      },
    }
  );

  // 모든 페이지에서 세션 갱신 (기존 영구 쿠키를 세션 쿠키로 변환)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호 경로가 아니면 여기서 종료 (세션 쿠키 변환만 수행)
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return response;
  }

  // 미인증 시 로그인 페이지로 리다이렉트
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 관리자 경로: role 확인
  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/mypage", request.url));
    }
  }

  // 강사 경로: is_instructor 확인
  if (pathname.startsWith("/instructor")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_instructor")
      .eq("id", user.id)
      .single();

    if (!profile?.is_instructor && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/mypage", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 모든 경로에서 실행 (정적 자원 제외)
     * 세션 쿠키 변환을 위해 모든 페이지 요청에서 미들웨어 실행
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
