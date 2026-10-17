import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { SmartImage } from "../ui/SmartImage";

export type CardProduct = Pick<Product, "slug" | "name" | "category" | "price" | "images" | "inStock">;

/** Portrait card. On hover the photo swaps to the product's second image (or zooms if there's only one). */
export function ProductCard({ product, priority }: { product: CardProduct; priority?: boolean }) {
  const [first, second] = product.images;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-sand">
        <div
          className={`absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-luxe)] ${
            second ? "" : "group-hover:scale-105"
          }`}
        >
          <SmartImage
            image={first}
            alt={product.name}
            sizes="(min-width:1024px) 25vw, 50vw"
            priority={priority}
            placeholderLabel={product.category}
          />
        </div>
        {second && (
          <div className="absolute inset-0 scale-105 opacity-0 transition-all duration-700 ease-[var(--ease-luxe)] group-hover:scale-100 group-hover:opacity-100">
            <SmartImage image={{ src: second.src }} alt="" sizes="(min-width:1024px) 25vw, 50vw" />
          </div>
        )}
        {!product.inStock && (
          <span className="absolute top-3 left-3 rounded-full bg-ivory/90 px-3 py-1 text-[10px] tracking-[0.2em] text-emerald-900 uppercase backdrop-blur">
            Sold out
          </span>
        )}
        <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-emerald-900/90 py-2.5 text-center text-[10px] tracking-[0.25em] text-ivory uppercase opacity-0 backdrop-blur transition-all duration-500 ease-[var(--ease-luxe)] group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden">
          View details
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-[10px] tracking-[0.25em] text-gold-700 uppercase">{product.category}</p>
        <h3 className="font-display text-xl leading-tight text-emerald-950 lg:text-[22px]">{product.name}</h3>
        <p className="text-sm text-muted">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export const toCardProduct = (p: Product): CardProduct => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  price: p.price,
  inStock: p.inStock,
  // the hover image never needs a blur placeholder, so drop it to keep payloads small
  images: p.images.slice(0, 2).map((img, i) => (i === 0 ? img : { src: img.src })),
});
