import type { Metadata } from "next";
import { siteImage } from "@/lib/products";
import { SmartImage } from "@/components/ui/SmartImage";
import { Reveal, WordReveal } from "@/components/ui/Reveal";
import { SweepLink } from "@/components/ui/Buttons";
import { LotusIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The story behind Citara Attires — modern ethnic wear rooted in Indian tradition, made with love in India.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Rooted",
    text: "Block prints, zari borders, gotta patti and mirror work — techniques passed down for generations, kept alive in every piece.",
  },
  {
    title: "Relaxed",
    text: "Breathable fabrics and easy silhouettes designed for real days: the commute, the office, the family lunch.",
  },
  {
    title: "Radiant",
    text: "Colours that make you feel like yourself — from quiet sage to festive wine — chosen to be worn again and again.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 lg:pt-36">
      <section className="container-x pb-16 lg:pb-24">
        <Reveal y={12}>
          <p className="eyebrow text-gold-700">Our story</p>
        </Reveal>
        <h1 className="mt-4 max-w-5xl font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] font-light text-emerald-900">
          <WordReveal text="Where heritage" className="block" />
          <WordReveal text="meets everyday." className="block text-gold-600 italic" delay={0.3} />
        </h1>
      </section>

      <section className="container-x grid items-center gap-12 pb-24 lg:grid-cols-2 lg:gap-24 lg:pb-36">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-sand">
          <SmartImage
            image={siteImage("about") ?? siteImage("story")}
            alt="Citara Attires"
            sizes="(min-width:1024px) 50vw, 100vw"
            priority
            className="object-cover object-[50%_30%]"
          />
        </Reveal>
        <div className="space-y-6 text-[16px] leading-relaxed text-muted">
          <Reveal>
            <LotusIcon className="h-10 w-16 text-gold-500" />
          </Reveal>
          <Reveal>
            <p className="font-display text-3xl leading-snug text-emerald-900 lg:text-4xl">
              Citara was born from a love for the anarkali twirl, the zari border and the quiet pride of wearing
              something made by hand.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              We wanted ethnic wear that didn&apos;t have to wait for a festival. Pieces you could throw on for a
              Tuesday and still feel celebrated in. So we started small — a handful of designs, fabrics we loved
              touching, and artisans whose work we admired.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>
              Today, every Citara kurti, tunic and salwar set is still chosen the same way: does it feel good, does
              it move well, and does it honour the craft it comes from? If the answer is yes, it makes it to you.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-emerald-800 py-20 text-ivory lg:py-32">
        <div className="container-x grid gap-12 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.12} className="border-t border-gold-500/30 pt-8">
              <p className="font-display text-sm text-gold-400 italic">0{i + 1}</p>
              <h2 className="mt-3 font-display text-5xl font-light">{v.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ivory/70">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-24 text-center lg:py-32">
        <Reveal>
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-none font-light text-emerald-900">
            Come find your <span className="text-gold-600 italic">favourite.</span>
          </h2>
          <div className="mt-10">
            <SweepLink href="/shop" variant="dark">
              Explore the collection
            </SweepLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
