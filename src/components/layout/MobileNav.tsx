"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { mainNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { MobileAuthStatus } from "./AuthStatus";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  if (!open) return null;

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />

      {/* 드로어 */}
      <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto shadow-xl">
        <div className="p-6 pt-20">
          <nav className="space-y-1">
            {mainNavigation.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setExpandedMenu(expandedMenu === item.label ? null : item.label)
                      }
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-colors",
                        pathname.startsWith(item.href)
                          ? "text-primary bg-surface"
                          : "text-text hover:bg-surface"
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform",
                          expandedMenu === item.label && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedMenu === item.label && (
                      <div className="ml-3 border-l-2 border-border-light pl-3 py-1 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              "block px-3 py-2 text-sm rounded-md transition-colors",
                              pathname === child.href
                                ? "text-primary font-medium"
                                : "text-text-sub hover:text-primary"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "block px-3 py-3 text-sm font-medium rounded-md transition-colors",
                      pathname.startsWith(item.href)
                        ? "text-primary bg-surface"
                        : "text-text hover:bg-surface"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* 로그인/회원가입 또는 사용자 메뉴 */}
          <div className="mt-8 pt-6 border-t border-border space-y-2">
            <MobileAuthStatus onClose={onClose} />
          </div>
        </div>
      </div>
    </>
  );
}
