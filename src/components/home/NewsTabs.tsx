"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Calendar, Star, Briefcase, ArrowRight, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  title: string;
  created_at?: string;
}

interface Review {
  id: string;
  title: string;
  created_at?: string;
}

interface Schedule {
  id: string;
  title: string;
  start_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_online?: boolean;
}

interface NewsTabsProps {
  notices: Notice[];
  reviews: Review[];
  upcomingSchedules: Schedule[];
}

const tabs = [
  { key: "notice", label: "공지사항", icon: MessageSquare },
  { key: "schedule", label: "교육일정", icon: Calendar },
  { key: "review", label: "교육후기", icon: Star },
  { key: "inquiry", label: "교육문의", icon: Briefcase },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function NewsTabs({ notices, reviews, upcomingSchedules }: NewsTabsProps) {
  const [active, setActive] = useState<TabKey>("notice");

  return (
    <div>
      {/* 탭 헤더 */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-border-light mb-8" role="tablist" aria-label="소식 & 일정">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              role="tab"
              aria-selected={active === tab.key}
              aria-controls={`panel-${tab.key}`}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px",
                active === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text-sub hover:border-border"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 패널 */}
      <div className="min-h-[280px]">
        {/* 공지사항 */}
        {active === "notice" && (
          <div id="panel-notice" role="tabpanel">
            {notices.length > 0 ? (
              <div className="bg-white rounded-xl p-6 lg:p-8">
                <ul className="space-y-4">
                  {notices.map((n) => (
                    <li key={n.id} className="flex items-center justify-between text-sm border-b border-border-light pb-4 last:border-0 last:pb-0">
                      <span className="text-text truncate mr-4 hover:text-primary transition-colors">{n.title}</span>
                      <span className="text-text-muted text-xs shrink-0">{n.created_at?.slice(0, 10)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <Link href="/community/notice" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors">
                    전체 공지사항 보기 <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-center text-text-muted text-sm py-10">등록된 공지사항이 없습니다.</p>
            )}
          </div>
        )}

        {/* 교육일정 */}
        {active === "schedule" && (
          <div id="panel-schedule" role="tabpanel">
            {upcomingSchedules.length > 0 ? (
              <div className="grid gap-4">
                {upcomingSchedules.map((s) => {
                  const d = new Date(s.start_date);
                  return (
                    <div key={s.id} className="bg-white rounded-xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/5 shrink-0">
                        <span className="text-xs text-primary font-medium">{d.getMonth() + 1}월</span>
                        <span className="text-2xl font-bold text-primary leading-none">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text text-sm">{s.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted">
                          {s.is_online !== undefined && (
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                              s.is_online ? "bg-info/10 text-info" : "bg-success/10 text-success"
                            )}>
                              {s.is_online ? "온라인" : "오프라인"}
                            </span>
                          )}
                          {s.location && !s.is_online && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} /> {s.location}
                            </span>
                          )}
                          {s.start_time && (
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} /> {s.start_time}{s.end_time ? `~${s.end_time}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="text-center mt-2">
                  <Link href="/community/schedule" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors">
                    전체 일정 보기 <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-center text-text-muted text-sm py-10">예정된 교육일정이 없습니다.</p>
            )}
          </div>
        )}

        {/* 교육후기 */}
        {active === "review" && (
          <div id="panel-review" role="tabpanel">
            {reviews.length > 0 ? (
              <div className="bg-white rounded-xl p-6 lg:p-8">
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="flex items-start gap-3 border-b border-border-light pb-4 last:border-0 last:pb-0">
                      <Star size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-text">{r.title}</p>
                        <p className="text-xs text-text-muted mt-1">{r.created_at?.slice(0, 10)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-center">
                  <Link href="/community/review" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors">
                    전체 후기 보기 <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-center text-text-muted text-sm py-10">등록된 교육후기가 없습니다.</p>
            )}
          </div>
        )}

        {/* 교육문의 */}
        {active === "inquiry" && (
          <div id="panel-inquiry" role="tabpanel">
            <div className="bg-white rounded-xl p-8 lg:p-10 text-center">
              <Briefcase size={32} className="mx-auto text-accent mb-4" />
              <h4 className="text-lg font-bold text-text mb-2">맞춤 교육이 필요하신가요?</h4>
              <p className="text-sm text-text-sub leading-relaxed mb-6 max-w-md mx-auto">
                기업·기관 맞춤 교육 프로그램부터 개인 역량 강화까지,
                교육 전문 컨설턴트가 최적의 프로그램을 제안해드립니다.
              </p>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-semibold text-sm rounded-full transition-colors"
              >
                교육문의 바로가기 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
