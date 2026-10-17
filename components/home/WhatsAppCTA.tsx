import { generalEnquiryLink } from "@/lib/whatsapp";
import { SweepLink } from "../ui/Buttons";
import { Reveal, WordReveal } from "../ui/Reveal";
import { LotusIcon } from "../ui/Icons";

export function WhatsAppCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-emerald-800 py-24 text-ivory lg:py-36">
      {/* woven gold rings, echoing the logo */}
      <svg
        viewBox="0 0 400 400"
        aria-hidden
        className="absolute top-1/2 left-1/2 -z-10 size-[150vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 animate-spin-slow text-gold-500/20 md:size-[90vw]"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={i}
            cx="200"
            cy="200"
            rx={150 + (i % 3) * 18}
            ry={140 + ((i + 1) % 3) * 16}
            transform={`rotate(${i * 20} 200 200)`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          />
        ))}
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return <circle key={i} cx={200 + Math.cos(a) * 165} cy={200 + Math.sin(a) * 158} r="2.2" fill="currentColor" />;
        })}
      </svg>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,transparent,var(--color-emerald-950))] opacity-70" />

      <div className="container-x flex flex-col items-center text-center">
        <Reveal y={12}>
          <LotusIcon className="h-10 w-16 text-gold-400" />
        </Reveal>
        <h2 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.95] font-light">
          <WordReveal text="Found something" inView className="block" />
          <WordReveal text="you love?" inView delay={0.25} className="block text-gold-400 italic" />
        </h2>
        <Reveal delay={0.3}>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ivory/75">
            No carts, no checkouts. Just send us a message — we&apos;ll help with sizing, colours and delivery, and
            reply personally.
          </p>
        </Reveal>
        <Reveal delay={0.4} className="mt-10">
          <SweepLink href={generalEnquiryLink()} external icon="whatsapp">
            Chat on WhatsApp
          </SweepLink>
        </Reveal>
      </div>
    </section>
  );
}
