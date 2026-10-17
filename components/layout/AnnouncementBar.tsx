import { site } from "@/lib/site";

export function AnnouncementBar() {
  // Content is repeated so the -50% translate loops seamlessly.
  const items = Array.from({ length: 4 }, () => site.announcement).flat();
  return (
    <div className="h-9 overflow-hidden border-b border-gold-500/15 bg-emerald-950 text-gold-300">
      <div className="flex h-full w-max animate-marquee items-center">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((text, i) => (
              <span key={i} className="eyebrow flex items-center text-[10px] tracking-[0.28em]">
                <span className="px-6">{text}</span>
                <span className="text-gold-500/70">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
