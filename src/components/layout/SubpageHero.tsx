import Link from "next/link";

interface SubpageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export function SubpageHero({ title, subtitle, breadcrumb }: SubpageHeroProps) {
  return (
    <section className="subpage-hero">
      <div className="container-custom relative z-10">
        {/* 브레드크럼 — "/" 구분자 */}
        {breadcrumb && (
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-6 tracking-wide">
            <Link href="/" className="hover:text-white/80 transition-colors">
              홈
            </Link>
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span>/</span>
                {item.href ? (
                  <Link href={item.href} className="hover:text-white/80 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white/80">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-base lg:text-lg text-white/60 max-w-2xl font-light">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
