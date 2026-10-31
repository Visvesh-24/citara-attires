import type { Metadata } from "next";
import { Suspense } from "react";
import { products } from "@/lib/products";
import { sortSizes } from "@/lib/sizes";
import { ShopClient, type ShopItem } from "@/components/shop/ShopClient";
import { toCardProduct } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "Shop Kurtis, Tunics, Co-ord Sets & Salwar Sets",
  description: "Browse the full Citara Attires collection of kurtis, tunics, co-ord sets and salwar sets. Order on WhatsApp.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const items: ShopItem[] = products.map((p, index) => ({
    ...toCardProduct(p),
    sku: p.sku,
    sizes: p.sizes,
    colors: p.colors,
    index,
  }));
  const sizes = sortSizes(new Set(products.flatMap((p) => p.sizes)));
  const prices = products.map((p) => p.price);
  // rounded to the nearest ₹100 so the slider steps always land on the bounds
  const priceBounds: [number, number] = prices.length
    ? [Math.floor(Math.min(...prices) / 100) * 100, Math.ceil(Math.max(...prices) / 100) * 100]
    : [0, 0];

  return (
    <div className="pt-28 lg:pt-36">
      <Suspense fallback={<ShopSkeleton />}>
        <ShopClient items={items} allSizes={sizes} priceBounds={priceBounds} />
      </Suspense>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="container-x pb-24">
      <div className="h-40 border-b border-gold-500/25" />
      <div className="mt-24 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:ml-[296px]">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-sand" />
        ))}
      </div>
    </div>
  );
}
