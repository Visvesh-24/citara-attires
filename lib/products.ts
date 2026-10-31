import productsJson from "@/data/generated/products.json";
import siteImagesJson from "@/data/generated/site-images.json";
import { CATEGORIES, type Category } from "./site";

export type ImageRef = { src: string; blur?: string };

export type Product = {
  sku: string;
  slug: string;
  name: string;
  category: Category;
  /** What the customer pays (the discounted price when there is one). */
  price: number;
  /** Original price, present only when the product is discounted. */
  mrp?: number;
  sizes: string[];
  colors: string[];
  description: string;
  images: ImageRef[];
  inStock: boolean;
};

export const products = productsJson as Product[];

export type SiteImageKey = "hero-1" | "hero-2" | "story" | "about";
export const siteImage = (key: SiteImageKey) =>
  (siteImagesJson as Record<string, ImageRef | null>)[key] ?? null;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const productsIn = (category: Category) => products.filter((p) => p.category === category);

/**
 * Newest first, mixed across categories: rows lower in the CSV are the latest arrivals,
 * and we take them round-robin so one category doesn't fill the whole row.
 */
export function newArrivals(count = 8) {
  const withPhotos = (list: Product[]) => (list.some((p) => p.images.length) ? list.filter((p) => p.images.length) : list);
  const queues = CATEGORIES.map((c) => withPhotos(productsIn(c)).reverse());
  const out: Product[] = [];
  while (out.length < count && queues.some((q) => q.length))
    for (const q of queues) if (q.length && out.length < count) out.push(q.shift()!);
  return out;
}

export const categoryCover = (category: Category) =>
  productsIn(category).find((p) => p.images.length)?.images[0] ?? null;

export const categoryCounts = () =>
  CATEGORIES.map((c) => ({ category: c, count: productsIn(c).length }));

/** Same category, preferring pieces with photos. */
export function relatedProducts(product: Product, count = 4) {
  return products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .sort((a, b) => Number(b.images.length > 0) - Number(a.images.length > 0))
    .slice(0, count);
}
