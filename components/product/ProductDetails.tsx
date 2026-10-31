"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useAnimationControls } from "framer-motion";
import type { Product } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { Price } from "../ui/Price";
import { productEnquiryLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "../ui/Icons";

export type ColourSibling = { slug: string; colour: string; image?: string };

export function ProductDetails({ product, siblings = [] }: { product: Product; siblings?: ColourSibling[] }) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [nudged, setNudged] = useState(false);
  const shake = useAnimationControls();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const nudge = () => {
    setNudged(true);
    shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.45 } });
    document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const cta = <BuyButton product={product} size={size} color={color} onNeedSize={nudge} />;

  return (
    <div>
      <p className="eyebrow text-gold-700">{product.category}</p>
      <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.75rem)] leading-[1] font-light text-emerald-950">
        {product.name}
      </h1>
      <Price price={product.price} mrp={product.mrp} size="lg" className="mt-4" />

      <div className="my-8 h-px bg-gold-500/25" />

      {siblings.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-[12px] tracking-[0.2em] text-emerald-900 uppercase">Also available in</p>
          <div className="flex flex-wrap gap-3">
            {siblings.map((s) => (
              <Link key={s.slug} href={`/product/${s.slug}`} className="group flex items-center gap-3 rounded-full border border-emerald-900/15 py-1 pr-4 pl-1 transition-colors hover:border-emerald-800">
                <span className="relative block size-9 overflow-hidden rounded-full bg-sand">
                  {s.image && <Image src={s.image} alt="" fill sizes="36px" className="object-cover transition-transform duration-500 group-hover:scale-110" />}
                </span>
                <span className="text-sm text-emerald-900">{s.colour}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {product.colors.length > 0 && (
        <fieldset className="mb-8">
          <legend className="mb-3 text-[12px] tracking-[0.2em] text-emerald-900 uppercase">
            Colour <span className="ml-2 tracking-normal text-muted normal-case">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-pressed={c === color}
                className={`rounded-full border px-5 py-2.5 text-sm transition-all duration-300 ${
                  c === color
                    ? "border-emerald-800 bg-emerald-800 text-ivory"
                    : "border-emerald-900/20 text-emerald-900 hover:border-emerald-800"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <motion.fieldset id="size-picker" animate={shake} className="mb-8 scroll-mt-32">
        <legend className="mb-3 text-[12px] tracking-[0.2em] text-emerald-900 uppercase">
          Size <span className="text-gold-700">*</span>
          {nudged && !size && (
            <span className="ml-3 tracking-normal text-red-700 normal-case">Please choose a size</span>
          )}
        </legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              aria-pressed={s === size}
              className={`grid h-12 min-w-12 place-items-center rounded-full border px-4 text-sm transition-all duration-300 ${
                s === size
                  ? "border-gold-600 bg-gold-500 text-emerald-950"
                  : nudged
                    ? "border-red-700/40 text-emerald-900 hover:border-emerald-800"
                    : "border-emerald-900/20 text-emerald-900 hover:border-emerald-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.fieldset>

      {cta}

      <p className="mt-4 text-center text-xs leading-relaxed text-muted">
        Prices shown are for reference. Final price, availability and delivery are confirmed on WhatsApp.
      </p>

      <div className="mt-10 space-y-6 border-t border-gold-500/25 pt-8">
        {product.description && (
          <div>
            <h2 className="text-[12px] tracking-[0.2em] text-emerald-900 uppercase">Description</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{product.description}</p>
          </div>
        )}
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px]">
          <dt className="text-muted">Category</dt>
          <dd className="text-emerald-900">{product.category}</dd>
          {product.colors.length > 0 && (
            <>
              <dt className="text-muted">Colour</dt>
              <dd className="text-emerald-900">{product.colors.join(", ")}</dd>
            </>
          )}
          <dt className="text-muted">Sizes</dt>
          <dd className="text-emerald-900">{product.sizes.join(", ")}</dd>
          <dt className="text-muted">SKU</dt>
          <dd className="text-emerald-900">{product.sku}</dd>
        </dl>
        <div>
          <h2 className="text-[12px] tracking-[0.2em] text-emerald-900 uppercase">How to order</h2>
          <ol className="mt-3 list-inside list-decimal space-y-1 text-[15px] text-muted">
            <li>Choose your colour and size</li>
            <li>Tap “Buy on WhatsApp” — your message is ready</li>
            <li>We confirm details and share payment & delivery options</li>
          </ol>
        </div>
      </div>

      {/* Mobile: keep the action in thumb reach (portalled so parent transforms can't affect `fixed`) */}
      {mounted && createPortal(
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold-500/20 bg-ivory/90 p-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 shrink-0">
            <p className="text-[10px] tracking-[0.15em] text-muted uppercase">{size ? `Size ${size}` : "Price"}</p>
            <p className="text-lg text-emerald-900">{formatPrice(product.price)}</p>
          </div>
          <div className="flex-1">{cta}</div>
        </div>
      </div>,
      document.body,
      )}
    </div>
  );
}

function BuyButton({
  product,
  size,
  color,
  onNeedSize,
}: {
  product: Product;
  size: string | null;
  color: string;
  onNeedSize: () => void;
}) {
  const base =
    "group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full py-4 text-[13px] font-medium tracking-[0.16em] uppercase";

  if (!product.inStock) {
    return (
      <div className={`${base} cursor-not-allowed border border-emerald-900/20 text-muted`} role="status">
        Out of stock
      </div>
    );
  }

  if (!size) {
    return (
      <button type="button" onClick={onNeedSize} aria-disabled className={`${base} bg-emerald-800/40 text-ivory`}>
        <WhatsAppIcon className="size-5" />
        <span className="max-sm:hidden">Select a size to buy</span>
        <span className="sm:hidden">Select a size</span>
      </button>
    );
  }

  return (
    <a
      href={productEnquiryLink(product, size, color)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-emerald-800 text-ivory`}
    >
      <span className="absolute inset-0 translate-y-full rounded-full bg-gold-500 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-y-0" />
      <span className="relative flex items-center gap-3 transition-colors duration-500 group-hover:text-emerald-950">
        <WhatsAppIcon className="size-5" />
        Buy on WhatsApp
      </span>
    </a>
  );
}
