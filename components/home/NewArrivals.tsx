import Link from "next/link";
import { newArrivals } from "@/lib/products";
import { ProductCard } from "../product/ProductCard";
import { Reveal } from "../ui/Reveal";
import { ArrowIcon } from "../ui/Icons";
import { SectionHeading } from "./SectionHeading";

export function NewArrivals() {
  const items = newArrivals(8);
  return (
    <section className="bg-ivory py-20 lg:py-32">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="Just landed" title="New Arrivals" />
          <Reveal y={12}>
            <Link href="/shop" className="group mb-3 flex items-center gap-2 text-[12px] tracking-[0.2em] text-emerald-900 uppercase">
              <span className="hidden sm:inline">View all</span>
              <span className="sm:hidden">All</span>
              <ArrowIcon className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:mt-16 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
          {items.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.1} y={40}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
