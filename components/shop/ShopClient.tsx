"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, CATEGORY_COPY, type Category } from "@/lib/site";
import { discountPercent, formatPrice } from "@/lib/format";
import { ProductCard, type CardProduct } from "../product/ProductCard";
import { CloseIcon, FilterIcon, SearchIcon } from "../ui/Icons";

export type ShopItem = CardProduct & { sku: string; sizes: string[]; colors: string[]; index: number };

const PAGE_SIZE = 24;

const SORTS = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  discount: "Biggest discount",
  name: "Name A–Z",
} as const;
type SortKey = keyof typeof SORTS;

const ease = [0.22, 1, 0.36, 1] as const;

export function ShopClient({
  items,
  allSizes,
  priceBounds,
}: {
  items: ShopItem[];
  allSizes: string[];
  priceBounds: [number, number];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Category lives in the URL so /shop?category=Kurtis and header links just work.
  const categoryParam = searchParams.get("category");
  const category = CATEGORIES.find((c) => c.toLowerCase() === categoryParam?.toLowerCase()) ?? null;

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sizes, setSizes] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>(priceBounds);
  const [sort, setSort] = useState<SortKey>("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const setCategory = (c: Category | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (c) params.set("category", c);
    else params.delete("category");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleSize = (s: string) => setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const resetFilters = () => {
    setSizes([]);
    setPrice(priceBounds);
    setQuery("");
    setCategory(null);
  };

  // Start from the first page whenever the result set changes.
  useEffect(() => setVisible(PAGE_SIZE), [category, deferredQuery, sizes, price, sort]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const results = useMemo(() => {
    const terms = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = items.filter((p) => {
      if (category && p.category !== category) return false;
      if (sizes.length && !sizes.some((s) => p.sizes.includes(s))) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (terms.length) {
        const haystack = `${p.name} ${p.category} ${p.sku} ${p.colors.join(" ")}`.toLowerCase();
        if (!terms.every((t) => haystack.includes(t))) return false;
      }
      return true;
    });
    const sorted = [...filtered];
    if (sort === "newest") sorted.sort((a, b) => b.index - a.index);
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "discount") sorted.sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp));
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    // in-stock pieces first, keeping the chosen order otherwise
    return sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock));
  }, [items, category, sizes, price, deferredQuery, sort]);

  const counts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c, items.filter((p) => p.category === c).length])),
    [items],
  );

  const activeFilterCount = sizes.length + (price[0] !== priceBounds[0] || price[1] !== priceBounds[1] ? 1 : 0);

  const filters = (
    <FilterPanel
      allSizes={allSizes}
      sizes={sizes}
      toggleSize={toggleSize}
      price={price}
      setPrice={setPrice}
      priceBounds={priceBounds}
    />
  );

  return (
    <div className="container-x pb-24">
      {/* Title */}
      <div className="border-b border-gold-500/25 pb-8">
        <p className="eyebrow text-gold-700">{category ? "Collection" : "The full edit"}</p>
        <AnimatePresence mode="wait">
          <motion.h1
            key={category ?? "all"}
            className="mt-3 font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] font-light text-emerald-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease }}
          >
            {category ?? "Shop all"}
          </motion.h1>
        </AnimatePresence>
        <p className="mt-3 max-w-md text-sm text-muted">
          {category ? CATEGORY_COPY[category] : "Kurtis, tunics, co-ord sets and salwar sets — modern silhouettes, timeless craft."}
        </p>

        <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {[null, ...CATEGORIES].map((c) => {
            const active = c === category;
            return (
              <button
                key={c ?? "all"}
                onClick={() => setCategory(c)}
                className={`relative shrink-0 rounded-full border px-5 py-2.5 text-[12px] tracking-[0.16em] uppercase transition-colors duration-300 ${
                  active ? "border-emerald-800 text-ivory" : "border-emerald-900/20 text-emerald-900 hover:border-emerald-800"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 rounded-full bg-emerald-800"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative">
                  {c ?? "All"}
                  <span className={`ml-1.5 text-[10px] ${active ? "text-gold-300" : "text-muted"}`}>
                    {c ? counts[c] : items.length}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 z-20 -mx-5 flex flex-wrap items-center gap-2 border-b border-gold-500/20 bg-ivory/90 px-5 py-3 backdrop-blur-xl sm:mx-0 sm:gap-3 sm:px-0 lg:top-20">
        <label className="relative basis-full sm:basis-0 sm:flex-1">
          <span className="sr-only">Search products</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, colour or SKU"
            className="h-11 w-full rounded-full border border-emerald-900/15 bg-ivory pr-4 pl-11 text-sm placeholder:text-muted/70 focus:border-emerald-800 focus:outline-none"
          />
        </label>
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-emerald-900/15 px-4 text-[12px] tracking-[0.14em] text-emerald-900 uppercase sm:flex-none lg:hidden"
        >
          <FilterIcon className="size-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-gold-500 text-[10px] text-emerald-950">
              {activeFilterCount}
            </span>
          )}
        </button>
        <label className="relative flex-1 sm:flex-none">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-11 w-full appearance-none rounded-full border border-emerald-900/15 bg-ivory px-4 text-[12px] tracking-[0.08em] text-emerald-900 focus:border-emerald-800 focus:outline-none sm:max-w-none sm:pr-10"
          >
            {Object.entries(SORTS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-40">{filters}</div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between text-[12px] tracking-[0.12em] text-muted uppercase">
            <span>
              {results.length} {results.length === 1 ? "piece" : "pieces"}
            </span>
            {(activeFilterCount > 0 || query || category) && (
              <button onClick={resetFilters} className="underline underline-offset-4 hover:text-emerald-900">
                Clear all
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-sm bg-sand px-6 py-20 text-center">
              <p className="font-display text-3xl text-emerald-900">Nothing matches just yet</p>
              <p className="mt-2 text-sm text-muted">Try removing a filter or searching for something else.</p>
              <button
                onClick={resetFilters}
                className="mt-6 rounded-full bg-emerald-800 px-6 py-3 text-[12px] tracking-[0.18em] text-ivory uppercase"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 lg:gap-y-14">
              {results.slice(0, visible).map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: (i % PAGE_SIZE) * 0.03, ease }}
                >
                  <ProductCard product={p} priority={i < 4} />
                </motion.div>
              ))}
            </div>
          )}

          {visible < results.length && (
            <div className="mt-16 flex flex-col items-center gap-4">
              <p className="text-xs tracking-[0.14em] text-muted uppercase">
                Showing {visible} of {results.length}
              </p>
              <div className="h-px w-40 overflow-hidden bg-emerald-900/10">
                <div className="h-full bg-gold-500" style={{ width: `${(visible / results.length) * 100}%` }} />
              </div>
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="mt-2 rounded-full border border-emerald-800 px-10 py-4 text-[12px] tracking-[0.2em] text-emerald-900 uppercase transition-colors duration-300 hover:bg-emerald-800 hover:text-ivory"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-emerald-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label="Filters"
              className="fixed inset-x-0 bottom-0 z-[61] max-h-[85svh] overflow-y-auto rounded-t-3xl bg-ivory px-6 pt-6 pb-8 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-3xl text-emerald-900">Filters</h2>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="p-1">
                  <CloseIcon />
                </button>
              </div>
              {filters}
              <button
                onClick={() => setDrawerOpen(false)}
                className="mt-8 w-full rounded-full bg-emerald-800 py-4 text-[12px] tracking-[0.2em] text-ivory uppercase"
              >
                Show {results.length} {results.length === 1 ? "piece" : "pieces"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({
  allSizes,
  sizes,
  toggleSize,
  price,
  setPrice,
  priceBounds,
}: {
  allSizes: string[];
  sizes: string[];
  toggleSize: (s: string) => void;
  price: [number, number];
  setPrice: (p: [number, number]) => void;
  priceBounds: [number, number];
}) {
  const [min, max] = priceBounds;
  const span = Math.max(1, max - min);
  const step = 50;
  const pct = (v: number) => ((v - min) / span) * 100;

  return (
    <div className="space-y-10">
      <div>
        <h3 className="mb-4 text-[12px] tracking-[0.2em] text-emerald-900 uppercase">Size</h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => {
            const active = sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                aria-pressed={active}
                className={`grid h-11 min-w-11 place-items-center rounded-full border px-3 text-sm transition-colors duration-300 ${
                  active
                    ? "border-gold-600 bg-gold-500 text-emerald-950"
                    : "border-emerald-900/20 text-emerald-900 hover:border-emerald-800"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {max > min && (
        <div>
          <h3 className="mb-4 flex justify-between text-[12px] tracking-[0.2em] text-emerald-900 uppercase">
            Price
            <span className="tracking-normal text-muted normal-case">
              {formatPrice(price[0])} – {formatPrice(price[1])}
            </span>
          </h3>
          <div className="relative h-6">
            <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-emerald-900/15" />
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-gold-500"
              style={{ left: `${pct(price[0])}%`, right: `${100 - pct(price[1])}%` }}
            />
            <input
              type="range"
              aria-label="Minimum price"
              className="dual-range"
              min={min}
              max={max}
              step={step}
              value={price[0]}
              onChange={(e) => setPrice([Math.min(Number(e.target.value), price[1]), price[1]])}
            />
            <input
              type="range"
              aria-label="Maximum price"
              className="dual-range"
              min={min}
              max={max}
              step={step}
              value={price[1]}
              onChange={(e) => setPrice([price[0], Math.max(Number(e.target.value), price[0])])}
            />
          </div>
        </div>
      )}
    </div>
  );
}
