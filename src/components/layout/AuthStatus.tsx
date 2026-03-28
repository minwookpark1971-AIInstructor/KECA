"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogIn, LogOut, User, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
      setLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        getUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="w-16 h-4 bg-surface rounded animate-pulse" />;
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className="flex items-center gap-1 hover:text-primary transition-colors">
          <LogIn size={12} />
          로그인
        </Link>
        <Link href="/register" className="hover:text-primary transition-colors">
          회원가입
        </Link>
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-1.5 hover:text-primary transition-colors"
      >
        <User size={12} />
        <span>{user.name}</span>님
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border-light rounded-lg shadow-lg z-50 py-1">
            <Link
              href="/mypage"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-sub hover:text-primary hover:bg-surface transition-colors"
            >
              <Settings size={14} />
              마이페이지
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-sub hover:text-primary hover:bg-surface transition-colors"
              >
                <Settings size={14} />
                관리자
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-sub hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileAuthStatus({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }

    getUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="h-10 bg-surface rounded animate-pulse" />;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          onClick={onClose}
          className="block w-full text-center py-2.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
        >
          로그인
        </Link>
        <Link
          href="/register"
          onClick={onClose}
          className="block w-full text-center py-2.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
        >
          회원가입
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="text-sm text-text-sub mb-3">
        <span className="font-medium text-text">{user.name}</span>님 안녕하세요
      </div>
      <Link
        href="/mypage"
        onClick={onClose}
        className="block w-full text-center py-2.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
      >
        마이페이지
      </Link>
      <button
        onClick={handleLogout}
        className="block w-full text-center py-2.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
      >
        로그아웃
      </button>
    </>
  );
}
