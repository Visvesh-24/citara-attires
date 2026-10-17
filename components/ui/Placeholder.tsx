import Image from "next/image";

type Props = {
  label?: string;
  tone?: "light" | "dark";
  className?: string;
  showLogo?: boolean;
};

/** Branded stand-in shown wherever a photo hasn't been uploaded yet. */
export function Placeholder({ label, tone = "light", className = "", showLogo = true }: Props) {
  const dark = tone === "dark";
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${
        dark
          ? "bg-[radial-gradient(120%_90%_at_30%_10%,var(--color-emerald-700),var(--color-emerald-900)_60%,var(--color-emerald-950))]"
          : "bg-[radial-gradient(120%_90%_at_30%_10%,var(--color-ivory),var(--color-sand)_55%,var(--color-sand-dark))]"
      } ${className}`}
    >
      {/* concentric gold arcs, a nod to the woven rings in the logo */}
      <svg
        viewBox="0 0 200 200"
        aria-hidden
        className={`absolute size-[140%] max-w-none ${dark ? "text-gold-500/15" : "text-gold-600/20"}`}
      >
        {[40, 55, 70, 85].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.4" />
        ))}
      </svg>
      {showLogo && (
      <div className="relative aspect-square w-[34%] max-w-36 min-w-16 overflow-hidden rounded-full shadow-[0_10px_40px_-10px_rgba(13,35,33,0.45)] ring-1 ring-gold-500/40">
        <Image src="/logo.png" alt="" fill sizes="144px" className="object-cover" />
      </div>
      )}
      {label && (
        <p
          className={`eyebrow relative mt-4 px-4 text-center text-[10px] ${dark ? "text-gold-300/70" : "text-emerald-800/50"}`}
        >
          {label}
        </p>
      )}
    </div>
  );
}
