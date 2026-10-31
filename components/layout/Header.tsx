"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { CATEGORIES, shopHref, site } from "@/lib/site";
import { generalEnquiryLink } from "@/lib/whatsapp";
import { AnnouncementBar } from "./AnnouncementBar";
import { Logo } from "./Logo";
import { CloseIcon, InstagramIcon, MenuIcon, WhatsAppIcon } from "../ui/Icons";

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const overHero = pathname === "/" && !scrolled && !menuOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-luxe)] ${
          scrolled ? "-translate-y-9" : "translate-y-0"
        }`}
      >
        <AnnouncementBar />
        <div className="relative">
          {/* solid layer fades in instead of animating background-color */}
          <div
            aria-hidden
            className={`absolute inset-0 border-b border-gold-500/15 bg-emerald-900/95 backdrop-blur-xl transition-opacity duration-500 ${
              overHero ? "opacity-0" : "opacity-100"
            }`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-950/60 to-transparent transition-opacity duration-500 ${
              overHero ? "opacity-100" : "opacity-0"
            }`}
          />
          <nav className="container-x relative flex h-16 items-center justify-between text-ivory lg:h-20">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="-ml-2 p-2 xl:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <ul className="hidden items-center gap-9 xl:flex">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <NavLink href={shopHref(c)}>{c}</NavLink>
                </li>
              ))}
            </ul>

            <div className="absolute left-1/2 -translate-x-1/2">
              <Logo size={42} />
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden items-center gap-9 xl:flex">
                <NavLink href="/shop">Shop all</NavLink>
                <NavLink href="/about">Our story</NavLink>
              </div>
              <a
                href={generalEnquiryLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="-mr-2 grid size-10 place-items-center rounded-full transition-colors duration-300 hover:bg-gold-500 hover:text-emerald-950"
              >
                <WhatsAppIcon className="size-[22px]" />
              </a>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative py-2 text-[12px] font-medium tracking-[0.22em] uppercase">
      {children}
      <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold-500 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:scale-x-100" />
    </Link>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const links = [
    ...CATEGORIES.map((c) => ({ href: shopHref(c), label: c })),
    { href: "/shop", label: "Shop all" },
    { href: "/about", label: "Our story" },
    { href: "/contact", label: "Contact" },
  ];
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-emerald-900 pt-28 text-ivory xl:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4 }}
    >
      <motion.ul
        className="container-x flex flex-col gap-2"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
      >
        {links.map((l) => (
          <motion.li
            key={l.href}
            className="overflow-hidden"
            variants={{
              hidden: { y: "100%", opacity: 0 },
              show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <Link href={l.href} onClick={onClose} className="block py-1 font-display text-[42px] leading-tight">
              {l.label}
            </Link>
          </motion.li>
        ))}
      </motion.ul>
      <motion.div
        className="container-x mt-auto flex items-center gap-6 border-t border-gold-500/20 py-8 text-gold-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}
      >
        <a href={generalEnquiryLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm">
          <WhatsAppIcon /> WhatsApp
        </a>
        <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm">
          <InstagramIcon /> @{site.instagramHandle}
        </a>
      </motion.div>
    </motion.div>
  );
}
