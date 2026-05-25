"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import useScrollY from "@/hooks/useScrollY";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Analyze" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const scrollY = useScrollY();

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 h-16 bg-transparent transition-colors duration-200",
        scrollY > 20 && "border-b border-[var(--border)]"
      )}
    >
      <div className="flex h-full items-center justify-between px-6 md:px-12">
        <Link href="/" className="text-lg font-bold leading-none text-white">
          FC
        </Link>
        <nav className="flex items-center gap-6 md:gap-10">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[13px] text-[var(--text-dim)] transition-colors duration-200 ease-out hover:text-white",
                  active && "text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
