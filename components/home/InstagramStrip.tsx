import type { ImageRef } from "@/lib/products";
import { site } from "@/lib/site";
import { SmartImage } from "../ui/SmartImage";
import { Reveal } from "../ui/Reveal";
import { InstagramIcon } from "../ui/Icons";

export function InstagramStrip({ images }: { images: (ImageRef | null)[] }) {
  return (
    <section className="bg-ivory py-20 lg:py-28">
      <div className="container-x">
        <Reveal className="text-center">
          <p className="eyebrow text-gold-700">As worn by you</p>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-none font-light text-emerald-900 italic transition-colors hover:text-gold-600"
          >
            @{site.instagramHandle}
          </a>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {images.map((img, i) => (
            <Reveal key={i} delay={i * 0.1} className={i % 2 ? "md:mt-12" : ""}>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Citara Attires on Instagram, photo ${i + 1}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-sm bg-sand"
              >
                <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-luxe)] group-hover:scale-110">
                  <SmartImage image={img} alt="" sizes="(min-width:768px) 25vw, 50vw" className="object-cover object-[50%_25%]" />
                </div>
                <div className="absolute inset-0 grid place-items-center bg-emerald-950/0 text-ivory opacity-0 transition-all duration-500 group-hover:bg-emerald-950/40 group-hover:opacity-100">
                  <InstagramIcon className="size-8" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
