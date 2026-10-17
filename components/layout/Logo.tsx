import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 44, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Citara Attires — home">
      <span
        className="relative block shrink-0 overflow-hidden rounded-full ring-1 ring-gold-500/40 transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:rotate-[20deg]"
        style={{ width: size, height: size }}
      >
        <Image src="/logo.png" alt="Citara Attires logo" fill sizes={`${size * 2}px`} className="scale-[1.18] object-cover" priority />
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[22px] font-medium tracking-[0.28em] text-gold-400">CITARA</span>
          <span className="mt-1 text-[8.5px] tracking-[0.55em] text-ivory/70">ATTIRES</span>
        </span>
      )}
    </Link>
  );
}
