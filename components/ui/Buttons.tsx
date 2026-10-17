import Link from "next/link";
import { ArrowIcon, WhatsAppIcon } from "./Icons";

type Variant = "gold" | "dark" | "outline-light";

const variants: Record<Variant, { base: string; fill: string; hoverText: string }> = {
  gold: { base: "bg-gold-500 text-emerald-950", fill: "bg-ivory", hoverText: "group-hover:text-emerald-950" },
  dark: { base: "bg-emerald-800 text-ivory", fill: "bg-gold-500", hoverText: "group-hover:text-emerald-950" },
  "outline-light": {
    base: "border border-ivory/60 text-ivory",
    fill: "bg-ivory",
    hoverText: "group-hover:text-emerald-950",
  },
};

/** Pill button with a fill that sweeps up from below and an arrow that nudges forward. */
export function SweepLink({
  href,
  children,
  variant = "gold",
  external,
  icon = "arrow",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  icon?: "arrow" | "whatsapp";
  className?: string;
}) {
  const v = variants[variant];
  const content = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 translate-y-full rounded-full ${v.fill} transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-y-0`}
      />
      <span className={`relative flex items-center gap-3 transition-colors duration-500 ${v.hoverText}`}>
        {icon === "whatsapp" && <WhatsAppIcon className="size-5" />}
        {children}
        {icon === "arrow" && (
          <ArrowIcon className="size-4 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1" />
        )}
      </span>
    </>
  );
  const cls = `group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-[13px] font-medium tracking-[0.18em] uppercase ${v.base} ${className}`;

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
