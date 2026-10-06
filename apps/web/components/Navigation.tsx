"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Research Support", path: "/research-support" },
  { name: "Contact", path: "/contact" },
];

export default function Navigation() {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const pathname = usePathname();
  const open = openPath === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasOpened = useRef(false);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (!open && !hasOpened.current) return;
    if (open) hasOpened.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !menu.animate) {
      menu.hidden = !open;
      return;
    }
    // Keep the closing panel visible only for its exit; inert prevents interaction.
    menu.hidden = false;
    const animation = menu.animate(open
      ? [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }]
      : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-4px)" }],
      { duration: open ? 180 : 120, easing: "ease-out" });
    animation.onfinish = () => { menu.hidden = !open; };
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { animation.cancel(); menu.hidden = !open; };
    preference.addEventListener("change", finish);
    return () => { animation.cancel(); preference.removeEventListener("change", finish); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPath(null);
        toggleRef.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenPath(null);
    };
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setOpenPath(null); };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    media.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      media.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <nav ref={navRef} className="sticky top-0 z-50 border-b border-[#E8E4DC] bg-white" aria-label="Main navigation">
      <div className="container-custom">
        <div className="flex h-18 items-center justify-between gap-4">
          <Link href="/" onClick={() => setOpenPath(null)} aria-label="ACCIAN home" className="shrink-0 rounded">
            <Image src="/Accian.png" alt="ACCIAN" width={252} height={76} priority className="h-auto w-32 sm:w-36" />
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {links.map((link) => (
              <Link key={link.path} href={link.path} aria-current={pathname === link.path ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 text-sm transition-colors duration-200 ${pathname === link.path ? "border-[#1B4FFF] font-semibold text-[#1B4FFF]" : "border-transparent text-[#555555] hover:text-[#0D0D0D]"}`}>
                {link.name}
              </Link>
            ))}
            <Link href="/pre-consultation" className="btn-primary">Start pre-consultation</Link>
          </div>
          <button ref={toggleRef} type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#D8D3C9] lg:hidden"
            onClick={() => setOpenPath(open ? null : pathname)} aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open} aria-controls="mobile-menu">
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        <div ref={menuRef} id="mobile-menu" hidden={!open} inert={!open} aria-hidden={!open} className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-[#E8E4DC] pb-5 pt-3 lg:hidden">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.path}>
                <Link href={link.path} onClick={() => setOpenPath(null)} aria-current={pathname === link.path ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-lg px-3 text-sm ${pathname === link.path ? "bg-[#1B4FFF]/[0.06] font-semibold text-[#1B4FFF]" : "text-[#555555] hover:bg-[#F5F3EE]"}`}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/pre-consultation" onClick={() => setOpenPath(null)} className="btn-primary mt-4 w-full">Start pre-consultation</Link>
          <p className="mt-2 text-center text-xs text-[#666666]">For research enquiries. <Link href="/contact" onClick={() => setOpenPath(null)} className="underline underline-offset-4">Contact us about technology services</Link>.</p>
        </div>
      </div>
    </nav>
  );
}
