"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CATEGORIES } from "@/lib/site";

/** Oversized outline type that drifts sideways as you scroll past. */
export function ScrollMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], reduce ? ["-10%", "-10%"] : ["0%", "-30%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], reduce ? ["-20%", "-20%"] : ["-35%", "-5%"]);
  const words = Array.from({ length: 4 }, () => CATEGORIES).flat();

  return (
    <div ref={ref} aria-hidden className="overflow-hidden border-y border-gold-500/25 bg-sand py-8 lg:py-12">
      {[x1, x2].map((x, row) => (
        <motion.div key={row} style={{ x }} className="flex w-max items-center whitespace-nowrap will-change-transform">
          {words.map((w, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`px-6 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[1.05] font-light ${
                  (i + row) % 2 ? "text-emerald-800 italic" : "text-transparent [-webkit-text-stroke:1px_var(--color-gold-600)]"
                }`}
              >
                {w}
              </span>
              <span className="text-2xl text-gold-500">✦</span>
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
