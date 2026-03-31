"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/supabase/mutations";
import type { Notification } from "@/types";

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    }
  }

  async function handleClick(n: Notification) {
    if (!n.is_read) {
      await markNotificationRead(n.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, is_read: true } : p)));
    }
    setOpen(false);
    if (n.reference_url) router.push(n.reference_url);
  }

  async function handleMarkAll() {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative hover:text-primary transition-colors">
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border-light rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
            <span className="text-sm font-semibold text-text">알림</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-primary hover:underline">
                모두 읽음
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">알림이 없습니다.</div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-border-light">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface transition-colors ${!n.is_read ? "bg-blue-50/50" : ""}`}
                >
                  <p className={`text-sm ${!n.is_read ? "font-medium text-text" : "text-text-sub"}`}>{n.title}</p>
                  {n.message && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-text-muted mt-1">
                    {new Date(n.created_at).toLocaleString("ko-KR")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
