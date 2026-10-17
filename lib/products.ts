import productsJson from "@/data/generated/products.json";
import siteImagesJson from "@/data/generated/site-images.json";
import { CATEGORIES, type Category } from "./site";

export type ImageRef = { src: string; blur?: string };

export type Product = {
  sku: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
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

/** Newest first: rows added at the bottom of the CSV are treated as the latest arrivals. */
export const newArrivals = (count = 8) => [...products].reverse().slice(0, count);

export const categoryCover = (category: Category) =>
  productsIn(category).find((p) => p.images.length)?.images[0] ?? null;

export const categoryCounts = () =>
  CATEGORIES.map((c) => ({ category: c, count: productsIn(c).length }));

export function relatedProducts(product: Product, count = 4) {
  return products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, count);
}
