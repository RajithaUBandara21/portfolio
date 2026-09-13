"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { publicNavItems, siteConfig } from "@/config/site";
import { isNavItemActive } from "@/lib/is-nav-item-active";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-6 text-sm">
            {publicNavItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);

              return (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "text-foreground font-medium transition-colors"
                        : "hover:text-foreground/80 text-foreground/70 transition-colors"
                    }
                  >
                    {item.label}
                  </Link>
                  <span
                    className={
                      active
                        ? "bg-foreground absolute -bottom-1 left-0 h-px w-full"
                        : "bg-foreground absolute -bottom-1 left-0 h-px w-0 transition-all duration-200 group-hover:w-full"
                    }
                  />
                </li>
              );
            })}
          </ul>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
