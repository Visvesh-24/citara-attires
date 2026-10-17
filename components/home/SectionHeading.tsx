import { Reveal, WordReveal } from "../ui/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <Reveal y={12}>
        <p className={`eyebrow mb-4 ${tone === "light" ? "text-gold-400" : "text-gold-700"}`}>{eyebrow}</p>
      </Reveal>
      <h2
        className={`font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] font-light ${
          tone === "light" ? "text-ivory" : "text-emerald-900"
        }`}
      >
        <WordReveal text={title} inView stagger={0.06} />
      </h2>
    </div>
  );
}
