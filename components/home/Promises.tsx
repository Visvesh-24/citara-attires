import { Reveal } from "../ui/Reveal";

const promises = [
  { n: "01", title: "Thoughtful fabrics", text: "Breathable cottons and soft blends chosen for Indian weather." },
  { n: "02", title: "Order on WhatsApp", text: "Pick your size, tap a button, and chat with a real person." },
  { n: "03", title: "Made in India", text: "Designed and finished with care by local artisans." },
];

export function Promises() {
  return (
    <section className="border-b border-gold-500/20 bg-ivory py-16 lg:py-20">
      <div className="container-x grid gap-10 md:grid-cols-3 md:gap-12">
        {promises.map((p, i) => (
          <Reveal key={p.n} delay={i * 0.12} className="flex gap-5">
            <span className="font-display text-4xl text-gold-500 italic">{p.n}</span>
            <div>
              <h3 className="font-display text-2xl text-emerald-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
