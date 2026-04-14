"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, User, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("profiles")
          .select("id, email, name, role")
          .eq("id", authUser.id)
          .single();
        setUser(data as Profile | null);
      }
    }

    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // 잔여 Supabase 쿠키 강제 삭제 (방어적 처리)
    document.cookie.split(";").forEach((c) => {
      const name = c.trim().split("=")[0];
      if (name.startsWith("sb-")) {
        document.cookie = `${name}=; path=/; max-age=0`;
      }
    });

    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border-light h-14">
      <div className="flex items-center justify-between h-full px-6">
        {/* 좌측: 로고 + 관리자 뱃지 */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-primary">KECA</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
              관리자
            </span>
          </Link>
        </div>

        {/* 우측: 사이트 이동 + 사용자명 + 로그아웃 */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
          >
            <Home size={13} />
            <span className="hidden sm:inline">사이트 보기</span>
          </Link>

          {user && (
            <span className="flex items-center gap-1.5 text-xs text-text-sub">
              <User size={13} />
              {user.name} 님
            </span>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-600 transition-colors"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
}
