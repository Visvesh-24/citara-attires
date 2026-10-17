import type { Metadata } from "next";
import { site } from "@/lib/site";
import { generalEnquiryLink } from "@/lib/whatsapp";
import { Reveal, WordReveal } from "@/components/ui/Reveal";
import { ArrowIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Citara Attires on WhatsApp or Instagram for orders, sizing help and custom requests.",
  alternates: { canonical: "/contact" },
};

const faqs = [
  {
    q: "How do I place an order?",
    a: "Open any product, choose your size and colour, and tap “Buy on WhatsApp”. We’ll confirm availability, payment and delivery right there in the chat.",
  },
  {
    q: "Can you help me with sizing?",
    a: "Of course. Send us your usual size or measurements on WhatsApp and we’ll suggest the best fit.",
  },
  { q: "Do you ship across India?", a: "Yes, we ship pan-India. Delivery timelines and charges are shared when you order." },
  {
    q: "Are the prices final?",
    a: "Prices on the site are for reference. We confirm the final price on WhatsApp before you pay.",
  },
];

export default function ContactPage() {
  const cards = [
    {
      href: generalEnquiryLink(),
      icon: <WhatsAppIcon className="size-7" />,
      label: "WhatsApp",
      value: "Chat with us",
      note: "Orders, sizing & custom requests",
    },
    {
      href: site.instagramUrl,
      icon: <InstagramIcon className="size-7" />,
      label: "Instagram",
      value: `@${site.instagramHandle}`,
      note: "New drops, styling & behind the scenes",
    },
  ];

  return (
    <div className="pt-28 lg:pt-36">
      <section className="container-x pb-16 lg:pb-24">
        <Reveal y={12}>
          <p className="eyebrow text-gold-700">Contact</p>
        </Reveal>
        <h1 className="mt-4 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] font-light text-emerald-900">
          <WordReveal text="Let’s talk" className="block" />
          <WordReveal text="style." className="block text-gold-600 italic" delay={0.25} />
        </h1>
        <Reveal delay={0.3}>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            The quickest way to reach us is WhatsApp — a real person replies, usually within a few hours.
          </p>
        </Reveal>
      </section>

      <section className="container-x grid gap-5 pb-24 md:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.1}>
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-full flex-col justify-between gap-16 overflow-hidden rounded-sm bg-emerald-800 p-8 text-ivory lg:p-12"
            >
              <span className="absolute inset-0 translate-y-full bg-gold-500 transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-y-0" />
              <div className="relative flex items-center justify-between transition-colors duration-500 group-hover:text-emerald-950">
                {c.icon}
                <ArrowIcon className="size-6 -rotate-45 transition-transform duration-500 group-hover:rotate-0" />
              </div>
              <div className="relative transition-colors duration-500 group-hover:text-emerald-950">
                <p className="eyebrow text-gold-400 transition-colors duration-500 group-hover:text-emerald-900">
                  {c.label}
                </p>
                <p className="mt-3 font-display text-4xl lg:text-5xl">{c.value}</p>
                <p className="mt-2 text-sm opacity-70">{c.note}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </section>

      <section className="bg-sand py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <h2 className="font-display text-5xl font-light text-emerald-900">Good to know</h2>
          </Reveal>
          <div className="divide-y divide-gold-500/30 border-y border-gold-500/30">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <details className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-2xl text-emerald-900 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="text-3xl leading-none font-light text-gold-600 transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
