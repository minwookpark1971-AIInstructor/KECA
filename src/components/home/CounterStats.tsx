"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: string;
  label: string;
}

function parseValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, suffix: value };
  return { target: parseInt(match[1], 10), suffix: match[2] };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CounterStats({ stats }: { stats: StatItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [displayValues, setDisplayValues] = useState<string[]>(
    stats.map(() => "0")
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(el);
          animate();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animate = () => {
    const duration = 1500;
    const parsed = stats.map((s) => parseValue(s.value));
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setDisplayValues(
        parsed.map((p) => {
          const current = Math.round(p.target * eased);
          return `${current}${p.suffix}`;
        })
      );

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  return (
    <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <div key={stat.label} className="text-center">
          <div className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            {displayValues[i]}
          </div>
          <div className="mt-2 text-sm text-text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
