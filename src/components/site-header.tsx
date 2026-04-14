"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { useSiteContent } from "@/components/site-content-provider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { content } = useSiteContent();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-[var(--aurare-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="font-serif text-2xl tracking-[0.15em] text-neutral-900">
          {content.brandName.toUpperCase()}
        </Link>
        <nav className="flex items-center gap-4 text-sm tracking-[0.08em] text-neutral-700 md:gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-65 hover:opacity-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs">
            {itemCount} items
          </span>
        </nav>
      </div>
    </header>
  );
}
