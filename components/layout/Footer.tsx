import Link from "next/link";
import { CATEGORIES, shopHref, site } from "@/lib/site";
import { generalEnquiryLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { InstagramIcon, WhatsAppIcon } from "../ui/Icons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-emerald-950 text-ivory/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-24">
        <div className="max-w-sm">
          <Logo size={56} />
          <p className="mt-6 text-sm leading-relaxed text-ivory/60">
            Modern ethnic wear, rooted in tradition. Thoughtfully designed kurtis, tunics and salwar sets — made
            with love in India.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={generalEnquiryLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid size-11 place-items-center rounded-full border border-gold-500/30 text-gold-400 transition-colors duration-300 hover:bg-gold-500 hover:text-emerald-950"
            >
              <WhatsAppIcon />
            </a>
            <a
              href={site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid size-11 place-items-center rounded-full border border-gold-500/30 text-gold-400 transition-colors duration-300 hover:bg-gold-500 hover:text-emerald-950"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>

        <FooterCol title="Shop">
          {CATEGORIES.map((c) => (
            <FooterLink key={c} href={shopHref(c)}>
              {c}
            </FooterLink>
          ))}
          <FooterLink href="/shop">All products</FooterLink>
        </FooterCol>

        <FooterCol title="Citara">
          <FooterLink href="/about">Our story</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterCol>

        <FooterCol title="Say hello">
          <a href={generalEnquiryLink()} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
            Order on WhatsApp
          </a>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
            @{site.instagramHandle}
          </a>
        </FooterCol>
      </div>

      <div className="container-x flex flex-col gap-2 border-t border-gold-500/15 py-6 text-[11px] tracking-[0.2em] text-ivory/40 uppercase sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Citara Attires</span>
        <span>Made with love in India</span>
      </div>

      <p
        aria-hidden
        className="pointer-events-none -mb-[0.22em] text-center font-display text-[26vw] leading-none tracking-[0.08em] text-gold-500/[0.06] select-none"
      >
        CITARA
      </p>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-5 text-gold-500">{title}</h3>
      <div className="flex flex-col gap-3 text-sm">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="transition-colors hover:text-gold-400">
      {children}
    </Link>
  );
}
