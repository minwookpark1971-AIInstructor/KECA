import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SubpageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function SubpageHero({ title, subtitle, breadcrumb }: SubpageHeroProps) {
  return (
    <section className="subpage-hero">
      <div className="container-custom">
        {/* 브레드크럼 */}
        {breadcrumb && (
          <nav className="flex items-center gap-1 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white/80 transition-colors">
              홈
            </Link>
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <ChevronRight size={14} />
                {item.href ? (
                  <Link href={item.href} className="hover:text-white/80 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white/90">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="text-3xl lg:text-4xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-base lg:text-lg text-white/70 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
