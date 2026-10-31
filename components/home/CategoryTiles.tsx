import Link from "next/link";
import { CATEGORIES, CATEGORY_COPY, shopHref } from "@/lib/site";
import { categoryCover, productsIn } from "@/lib/products";
import { SmartImage } from "../ui/SmartImage";
import { Reveal } from "../ui/Reveal";
import { ArrowIcon } from "../ui/Icons";
import { SectionHeading } from "./SectionHeading";

export function CategoryTiles() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container-x flex items-end justify-between gap-6">
        <SectionHeading eyebrow="Shop by category" title="The Collections" />
        <Reveal y={12} className="hidden max-w-xs pb-3 text-sm leading-relaxed text-muted md:block">
          Four ways to wear tradition, endless ways to make it yours. Find the one that feels like you.
        </Reveal>
      </div>

      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:px-8 md:container-x md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:mt-16 lg:grid-cols-4 lg:gap-5">
        {CATEGORIES.map((category, i) => (
          <Reveal
            key={category}
            delay={i * 0.12}
            className={`w-[78%] shrink-0 snap-center sm:w-[55%] md:w-auto ${i % 2 ? "md:mt-16" : ""}`}
          >
            <Link href={shopHref(category)} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-sand">
                <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-luxe)] group-hover:scale-[1.07]">
                  <SmartImage
                    image={categoryCover(category)}
                    alt={category}
                    sizes="(min-width:1024px) 25vw, (min-width:768px) 50vw, 78vw"
                    placeholderLabel={category}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-ivory lg:p-8">
                  <div>
                    <p className="eyebrow text-[10px] text-gold-300">{productsIn(category).length} styles</p>
                    <h3 className="mt-2 font-display text-4xl font-light lg:text-[2.4rem] xl:text-5xl">{category}</h3>
                    <p className="mt-2 text-sm font-light text-ivory/75">{CATEGORY_COPY[category]}</p>
                  </div>
                  <span className="absolute top-5 right-5 grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gold-500 text-emerald-950 transition-all duration-500 ease-[var(--ease-luxe)] md:translate-x-4 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
                    <ArrowIcon className="size-5 transition-transform duration-500 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
