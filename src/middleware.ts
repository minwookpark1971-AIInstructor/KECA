import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 보호 경로 패턴
const protectedPaths = ["/mypage", "/instructor", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 보호 경로가 아니면 통과
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Supabase 세션 확인
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
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  matcher: ["/mypage/:path*", "/instructor/:path*", "/admin/:path*"],
};
